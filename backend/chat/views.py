"""
Views for chat app.
"""

from django.conf import settings
from django.db.models import Q
from django.utils import timezone
from rest_framework import status, generics, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from matching.models import Match
from .models import Conversation, Message, ChatRequest
from .serializers import (
    ConversationSerializer, ConversationDetailSerializer,
    MessageSerializer, MessageCreateSerializer,
    ChatRequestSerializer, ChatRequestCreateSerializer
)


class ConversationListView(generics.ListAPIView):
    """
    List all conversations for the current user.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ConversationSerializer
    
    def get_queryset(self):
        profile = self.request.user.profile
        return Conversation.objects.filter(
            Q(participant1=profile) | Q(participant2=profile),
            is_active=True
        ).select_related(
            'participant1', 'participant2',
            'participant1__user', 'participant2__user'
        )


class ConversationDetailView(generics.RetrieveAPIView):
    """
    Get conversation details with messages.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ConversationDetailSerializer
    lookup_field = 'id'
    
    def get_queryset(self):
        profile = self.request.user.profile
        return Conversation.objects.filter(
            Q(participant1=profile) | Q(participant2=profile)
        )
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Mark messages as read
        instance.mark_as_read(request.user.profile)
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class GetOrCreateConversationView(views.APIView):
    """
    Get existing conversation with a match or create one.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, match_id):
        profile = request.user.profile
        
        try:
            # Find the match
            match = Match.objects.get(
                Q(profile1=profile) | Q(profile2=profile),
                id=match_id,
                status='active'
            )
            
            # Check if chat is unlocked (skip in DEBUG mode for development)
            if not settings.DEBUG:
                if not match.chat_unlocked and not request.user.is_premium:
                    return Response(
                        {'error': 'Chat is not unlocked. Send a chat request first.'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            # Get or create conversation
            conversation, created = Conversation.objects.get_or_create(
                match=match,
                defaults={
                    'participant1': match.profile1,
                    'participant2': match.profile2,
                }
            )
            
            return Response(
                ConversationDetailSerializer(
                    conversation,
                    context={'request': request}
                ).data,
                status=status.HTTP_200_OK
            )
            
        except Match.DoesNotExist:
            return Response(
                {'error': 'Match not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class SendMessageView(views.APIView):
    """
    Send a message in a conversation.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, conversation_id):
        serializer = MessageCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            profile = request.user.profile
            
            try:
                conversation = Conversation.objects.get(
                    Q(participant1=profile) | Q(participant2=profile),
                    id=conversation_id,
                    is_active=True
                )
                
                # Check if chat is unlocked (skip in DEBUG mode for development)
                if not settings.DEBUG:
                    if not conversation.match.chat_unlocked and not request.user.is_premium:
                        return Response(
                            {'error': 'Chat is not unlocked.'},
                            status=status.HTTP_403_FORBIDDEN
                        )
                
                message = Message.objects.create(
                    conversation=conversation,
                    sender=profile,
                    message_type=serializer.validated_data.get('message_type', 'text'),
                    content=serializer.validated_data['content']
                )
                
                return Response(
                    MessageSerializer(message, context={'request': request}).data,
                    status=status.HTTP_201_CREATED
                )
                
            except Conversation.DoesNotExist:
                return Response(
                    {'error': 'Conversation not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MessageListView(generics.ListAPIView):
    """
    Get paginated messages for a conversation.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer
    pagination_class = None  # Disable pagination for messages to avoid union issue
    
    def get_queryset(self):
        profile = self.request.user.profile
        conversation_id = self.kwargs.get('conversation_id')
        
        # Use Q objects instead of union to avoid SQLite ORDER BY issue
        return Message.objects.filter(
            Q(conversation__participant1=profile) | Q(conversation__participant2=profile),
            conversation_id=conversation_id
        ).order_by('created_at')


class MarkAsReadView(views.APIView):
    """
    Mark all messages in a conversation as read.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, conversation_id):
        profile = request.user.profile
        
        try:
            conversation = Conversation.objects.get(
                Q(participant1=profile) | Q(participant2=profile),
                id=conversation_id
            )
            
            conversation.mark_as_read(profile)
            
            return Response(
                {'message': 'Messages marked as read.'},
                status=status.HTTP_200_OK
            )
        except Conversation.DoesNotExist:
            return Response(
                {'error': 'Conversation not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class SendChatRequestView(views.APIView):
    """
    Send a chat request to unlock conversation.
    For non-premium users.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ChatRequestCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            profile = request.user.profile
            match_id = serializer.validated_data['match_id']
            
            try:
                match = Match.objects.get(
                    Q(profile1=profile) | Q(profile2=profile),
                    id=match_id,
                    status='active'
                )
                
                # Check if already unlocked
                if match.chat_unlocked:
                    return Response(
                        {'message': 'Chat is already unlocked.'},
                        status=status.HTTP_200_OK
                    )
                
                # Get the other profile
                to_profile = match.get_other_profile(profile)
                
                # Check if request already exists
                if ChatRequest.objects.filter(
                    from_profile=profile,
                    to_profile=to_profile,
                    status='pending'
                ).exists():
                    return Response(
                        {'error': 'Chat request already sent.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                chat_request = ChatRequest.objects.create(
                    from_profile=profile,
                    to_profile=to_profile,
                    match=match,
                    message=serializer.validated_data.get('message', '')
                )
                
                return Response(
                    ChatRequestSerializer(chat_request).data,
                    status=status.HTTP_201_CREATED
                )
                
            except Match.DoesNotExist:
                return Response(
                    {'error': 'Match not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChatRequestListView(generics.ListAPIView):
    """
    List received chat requests.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ChatRequestSerializer
    
    def get_queryset(self):
        return ChatRequest.objects.filter(
            to_profile=self.request.user.profile,
            status='pending'
        ).select_related('from_profile', 'from_profile__user')


class RespondChatRequestView(views.APIView):
    """
    Accept or decline a chat request.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, request_id):
        action = request.data.get('action')
        
        if action not in ['accept', 'decline']:
            return Response(
                {'error': 'Invalid action. Use "accept" or "decline".'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            chat_request = ChatRequest.objects.get(
                id=request_id,
                to_profile=request.user.profile,
                status='pending'
            )
            
            if action == 'accept':
                chat_request.accept()
                
                # Return the conversation
                conversation = Conversation.objects.get(match=chat_request.match)
                return Response({
                    'message': 'Chat request accepted.',
                    'conversation': ConversationSerializer(
                        conversation,
                        context={'request': request}
                    ).data
                }, status=status.HTTP_200_OK)
            else:
                chat_request.decline()
                return Response(
                    {'message': 'Chat request declined.'},
                    status=status.HTTP_200_OK
                )
                
        except ChatRequest.DoesNotExist:
            return Response(
                {'error': 'Chat request not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class UnreadCountView(views.APIView):
    """
    Get total unread message count.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        profile = request.user.profile
        
        # Count unread messages across all conversations
        total_unread = 0
        
        conversations_p1 = Conversation.objects.filter(
            participant1=profile, is_active=True
        )
        for conv in conversations_p1:
            total_unread += conv.unread_count_p1
        
        conversations_p2 = Conversation.objects.filter(
            participant2=profile, is_active=True
        )
        for conv in conversations_p2:
            total_unread += conv.unread_count_p2
        
        return Response({'unread_count': total_unread})
