"""
Serializers for chat app.
"""

from rest_framework import serializers
from profiles.serializers import ProfileListSerializer
from .models import Conversation, Message, ChatRequest


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for messages."""
    
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    is_mine = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'sender_name', 'message_type', 'content',
            'image', 'is_read', 'read_at', 'is_mine', 'created_at'
        ]
        read_only_fields = ['id', 'sender', 'is_read', 'read_at', 'created_at']
    
    def get_is_mine(self, obj):
        request = self.context.get('request')
        if request and hasattr(request.user, 'profile'):
            return obj.sender == request.user.profile
        return False


class MessageCreateSerializer(serializers.Serializer):
    """Serializer for creating messages."""
    
    content = serializers.CharField(max_length=5000)
    message_type = serializers.ChoiceField(
        choices=Message.MESSAGE_TYPE_CHOICES,
        default='text'
    )


class ConversationSerializer(serializers.ModelSerializer):
    """Serializer for conversations."""
    
    other_participant = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'other_participant', 'last_message', 'last_message_at',
            'unread_count', 'is_active', 'created_at'
        ]
    
    def get_other_participant(self, obj):
        request = self.context.get('request')
        if request and hasattr(request.user, 'profile'):
            other = obj.get_other_participant(request.user.profile)
            return ProfileListSerializer(other).data
        return None
    
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and hasattr(request.user, 'profile'):
            return obj.get_unread_count(request.user.profile)
        return 0


class ConversationDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for conversation with messages."""
    
    other_participant = serializers.SerializerMethodField()
    messages = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'other_participant', 'is_active',
            'messages', 'created_at'
        ]
    
    def get_other_participant(self, obj):
        request = self.context.get('request')
        if request and hasattr(request.user, 'profile'):
            other = obj.get_other_participant(request.user.profile)
            return ProfileListSerializer(other).data
        return None
    
    def get_messages(self, obj):
        request = self.context.get('request')
        messages = obj.messages.order_by('-created_at')[:50]
        return MessageSerializer(
            messages,
            many=True,
            context={'request': request}
        ).data


class ChatRequestSerializer(serializers.ModelSerializer):
    """Serializer for chat requests."""
    
    from_profile = ProfileListSerializer(read_only=True)
    to_profile = ProfileListSerializer(read_only=True)
    
    class Meta:
        model = ChatRequest
        fields = [
            'id', 'from_profile', 'to_profile', 'message',
            'status', 'created_at', 'responded_at'
        ]
        read_only_fields = ['id', 'from_profile', 'status', 'created_at', 'responded_at']


class ChatRequestCreateSerializer(serializers.Serializer):
    """Serializer for creating chat requests."""
    
    match_id = serializers.UUIDField()
    message = serializers.CharField(max_length=500, required=False, allow_blank=True)
