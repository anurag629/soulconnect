"""
Serializers for matching app.
"""

from rest_framework import serializers
from profiles.serializers import ProfileListSerializer
from .models import Like, Pass, Match, InterestRequest, Shortlist


class LikeSerializer(serializers.ModelSerializer):
    """Serializer for likes."""
    
    to_profile = ProfileListSerializer(read_only=True)
    from_profile = ProfileListSerializer(read_only=True)
    
    class Meta:
        model = Like
        fields = ['id', 'from_profile', 'to_profile', 'like_type', 'message', 'created_at']
        read_only_fields = ['id', 'from_profile', 'created_at']


class LikeCreateSerializer(serializers.Serializer):
    """Serializer for creating a like."""
    
    profile_id = serializers.UUIDField()
    like_type = serializers.ChoiceField(choices=Like.LIKE_TYPE_CHOICES, default='like')
    message = serializers.CharField(max_length=500, required=False, allow_blank=True)


class PassSerializer(serializers.ModelSerializer):
    """Serializer for passes."""
    
    class Meta:
        model = Pass
        fields = ['id', 'to_profile', 'created_at']
        read_only_fields = ['id', 'created_at']


class MatchSerializer(serializers.ModelSerializer):
    """Serializer for matches."""
    
    other_profile = serializers.SerializerMethodField()
    
    class Meta:
        model = Match
        fields = ['id', 'other_profile', 'status', 'matched_at', 'chat_unlocked']
        read_only_fields = ['id', 'matched_at']
    
    def get_other_profile(self, obj):
        request = self.context.get('request')
        if request and hasattr(request.user, 'profile'):
            other = obj.get_other_profile(request.user.profile)
            return ProfileListSerializer(other).data
        return None


class InterestRequestSerializer(serializers.ModelSerializer):
    """Serializer for interest requests."""
    
    from_profile = ProfileListSerializer(read_only=True)
    to_profile = ProfileListSerializer(read_only=True)
    
    class Meta:
        model = InterestRequest
        fields = [
            'id', 'from_profile', 'to_profile', 'message',
            'status', 'created_at', 'responded_at'
        ]
        read_only_fields = ['id', 'from_profile', 'status', 'created_at', 'responded_at']


class InterestRequestCreateSerializer(serializers.Serializer):
    """Serializer for creating an interest request."""
    
    profile_id = serializers.UUIDField()
    message = serializers.CharField(max_length=1000, required=False, allow_blank=True)


class ShortlistSerializer(serializers.ModelSerializer):
    """Serializer for shortlist."""
    
    shortlisted_profile = ProfileListSerializer(read_only=True)
    
    class Meta:
        model = Shortlist
        fields = ['id', 'shortlisted_profile', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']


class ShortlistCreateSerializer(serializers.Serializer):
    """Serializer for creating a shortlist entry."""
    
    profile_id = serializers.UUIDField()
    notes = serializers.CharField(max_length=500, required=False, allow_blank=True)
