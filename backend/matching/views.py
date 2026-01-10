"""
Views for matching app.
"""

from django.db.models import Q
from django.utils import timezone
from rest_framework import status, generics, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from profiles.models import Profile
from profiles.serializers import ProfileListSerializer
from .models import Like, Pass, Match, InterestRequest, Shortlist
from .serializers import (
    LikeSerializer, LikeCreateSerializer, MatchSerializer,
    InterestRequestSerializer, InterestRequestCreateSerializer,
    ShortlistSerializer, ShortlistCreateSerializer
)
from .algorithm import matching_algorithm


class SendLikeView(views.APIView):
    """
    Send a like to a profile.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = LikeCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            profile_id = serializer.validated_data['profile_id']
            
            try:
                to_profile = Profile.objects.get(id=profile_id)
                
                # Check if already liked
                if Like.objects.filter(
                    from_profile=request.user.profile,
                    to_profile=to_profile
                ).exists():
                    return Response(
                        {'error': 'You have already liked this profile.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Create like
                like = Like.objects.create(
                    from_profile=request.user.profile,
                    to_profile=to_profile,
                    like_type=serializer.validated_data.get('like_type', 'like'),
                    message=serializer.validated_data.get('message', '')
                )
                
                # Check if it's a mutual like (match)
                is_match = Match.objects.filter(
                    Q(profile1=request.user.profile, profile2=to_profile) |
                    Q(profile1=to_profile, profile2=request.user.profile)
                ).exists()
                
                return Response({
                    'message': 'Like sent successfully.',
                    'is_match': is_match,
                    'like': LikeSerializer(like).data
                }, status=status.HTTP_201_CREATED)
                
            except Profile.DoesNotExist:
                return Response(
                    {'error': 'Profile not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SendPassView(views.APIView):
    """
    Pass (skip) a profile.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, profile_id):
        try:
            to_profile = Profile.objects.get(id=profile_id)
            
            Pass.objects.get_or_create(
                from_profile=request.user.profile,
                to_profile=to_profile
            )
            
            return Response(
                {'message': 'Profile passed.'},
                status=status.HTTP_200_OK
            )
        except Profile.DoesNotExist:
            return Response(
                {'error': 'Profile not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class LikesSentView(generics.ListAPIView):
    """
    List profiles the user has liked.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = LikeSerializer
    
    def get_queryset(self):
        return Like.objects.filter(
            from_profile=self.request.user.profile
        ).select_related('to_profile', 'to_profile__user')


class LikesReceivedView(generics.ListAPIView):
    """
    List profiles that have liked the user.
    Premium feature - shows who liked you.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = LikeSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        # Only premium users can see who liked them
        if not user.is_premium:
            return Like.objects.none()
        
        return Like.objects.filter(
            to_profile=user.profile
        ).select_related('from_profile', 'from_profile__user')


class MatchListView(generics.ListAPIView):
    """
    List all matches.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = MatchSerializer
    
    def get_queryset(self):
        profile = self.request.user.profile
        return Match.objects.filter(
            Q(profile1=profile) | Q(profile2=profile),
            status='active'
        ).select_related(
            'profile1', 'profile2',
            'profile1__user', 'profile2__user'
        )


class UnmatchView(views.APIView):
    """
    Unmatch from a connection.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, match_id):
        try:
            profile = request.user.profile
            match = Match.objects.get(
                Q(profile1=profile) | Q(profile2=profile),
                id=match_id
            )
            
            match.unmatch(profile)
            
            return Response(
                {'message': 'Unmatched successfully.'},
                status=status.HTTP_200_OK
            )
        except Match.DoesNotExist:
            return Response(
                {'error': 'Match not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class SendInterestView(views.APIView):
    """
    Send an interest request.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = InterestRequestCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            profile_id = serializer.validated_data['profile_id']
            
            try:
                to_profile = Profile.objects.get(id=profile_id)
                
                # Check if already sent
                if InterestRequest.objects.filter(
                    from_profile=request.user.profile,
                    to_profile=to_profile
                ).exists():
                    return Response(
                        {'error': 'You have already sent an interest request.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                interest = InterestRequest.objects.create(
                    from_profile=request.user.profile,
                    to_profile=to_profile,
                    message=serializer.validated_data.get('message', '')
                )
                
                return Response({
                    'message': 'Interest request sent.',
                    'interest': InterestRequestSerializer(interest).data
                }, status=status.HTTP_201_CREATED)
                
            except Profile.DoesNotExist:
                return Response(
                    {'error': 'Profile not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InterestsSentView(generics.ListAPIView):
    """
    List interests sent by the user.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = InterestRequestSerializer
    
    def get_queryset(self):
        return InterestRequest.objects.filter(
            from_profile=self.request.user.profile
        ).select_related('to_profile', 'to_profile__user')


class InterestsReceivedView(generics.ListAPIView):
    """
    List interests received by the user.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = InterestRequestSerializer
    
    def get_queryset(self):
        return InterestRequest.objects.filter(
            to_profile=self.request.user.profile
        ).select_related('from_profile', 'from_profile__user')


class RespondToInterestView(views.APIView):
    """
    Accept or decline an interest request.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, interest_id):
        action = request.data.get('action')
        
        if action not in ['accept', 'decline']:
            return Response(
                {'error': 'Invalid action. Use "accept" or "decline".'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            interest = InterestRequest.objects.get(
                id=interest_id,
                to_profile=request.user.profile,
                status='pending'
            )
            
            if action == 'accept':
                interest.accept()
                message = 'Interest accepted. You are now connected!'
            else:
                interest.decline()
                message = 'Interest declined.'
            
            return Response(
                {'message': message},
                status=status.HTTP_200_OK
            )
        except InterestRequest.DoesNotExist:
            return Response(
                {'error': 'Interest request not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class ShortlistView(generics.ListCreateAPIView):
    """
    List and add to shortlist.
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ShortlistCreateSerializer
        return ShortlistSerializer
    
    def get_queryset(self):
        return Shortlist.objects.filter(
            profile=self.request.user.profile
        ).select_related('shortlisted_profile', 'shortlisted_profile__user')
    
    def create(self, request, *args, **kwargs):
        serializer = ShortlistCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            profile_id = serializer.validated_data['profile_id']
            
            try:
                to_shortlist = Profile.objects.get(id=profile_id)
                
                shortlist, created = Shortlist.objects.get_or_create(
                    profile=request.user.profile,
                    shortlisted_profile=to_shortlist,
                    defaults={'notes': serializer.validated_data.get('notes', '')}
                )
                
                if not created:
                    return Response(
                        {'message': 'Profile already shortlisted.'},
                        status=status.HTTP_200_OK
                    )
                
                return Response(
                    ShortlistSerializer(shortlist).data,
                    status=status.HTTP_201_CREATED
                )
                
            except Profile.DoesNotExist:
                return Response(
                    {'error': 'Profile not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RemoveFromShortlistView(views.APIView):
    """
    Remove a profile from shortlist.
    """
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, profile_id):
        Shortlist.objects.filter(
            profile=request.user.profile,
            shortlisted_profile_id=profile_id
        ).delete()
        
        return Response(
            {'message': 'Removed from shortlist.'},
            status=status.HTTP_200_OK
        )


class RecommendedProfilesView(views.APIView):
    """
    Get AI-recommended profiles based on preferences.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        profile = request.user.profile
        
        recommendations = matching_algorithm.get_recommended_profiles(
            profile=profile,
            limit=20
        )
        
        result = []
        for rec in recommendations:
            profile_data = ProfileListSerializer(rec['profile']).data
            profile_data['compatibility_score'] = rec['score']
            profile_data['is_recommended'] = rec['is_match']
            result.append(profile_data)
        
        return Response({
            'count': len(result),
            'results': result
        })


class CompatibilityScoreView(views.APIView):
    """
    Get compatibility score with a specific profile.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, profile_id):
        try:
            target_profile = Profile.objects.get(id=profile_id)
            
            compatibility = matching_algorithm.calculate_compatibility(
                request.user.profile,
                target_profile
            )
            
            return Response({
                'profile_id': str(profile_id),
                'total_score': compatibility['total_score'],
                'breakdown': compatibility['breakdown'],
                'is_good_match': compatibility['is_match']
            })
        except Profile.DoesNotExist:
            return Response(
                {'error': 'Profile not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
