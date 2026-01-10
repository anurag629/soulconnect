"""
Admin panel serializers.
"""

from rest_framework import serializers
from accounts.models import User
from profiles.models import Profile, ProfilePhoto, GovernmentID
from reports.models import Report


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for admin user management."""
    
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'is_email_verified', 'is_profile_complete', 'is_profile_approved',
            'is_id_verified', 'is_premium', 'is_active', 'is_banned',
            'ban_reason', 'last_active', 'created_at'
        ]
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()


class AdminProfileSerializer(serializers.ModelSerializer):
    """Detailed serializer for admin profile management."""
    
    user = AdminUserSerializer(read_only=True)
    age = serializers.ReadOnlyField()
    photo_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = '__all__'
    
    def get_photo_count(self, obj):
        return obj.photos.count()


class AdminPhotoSerializer(serializers.ModelSerializer):
    """Serializer for photo moderation."""
    
    profile_name = serializers.CharField(source='profile.full_name', read_only=True)
    
    class Meta:
        model = ProfilePhoto
        fields = [
            'id', 'profile', 'profile_name', 'image', 'thumbnail',
            'is_primary', 'is_approved', 'is_rejected',
            'rejection_reason', 'uploaded_at'
        ]


class AdminGovernmentIDSerializer(serializers.ModelSerializer):
    """Serializer for ID verification."""
    
    profile_name = serializers.CharField(source='profile.full_name', read_only=True)
    profile_email = serializers.CharField(source='profile.user.email', read_only=True)
    
    class Meta:
        model = GovernmentID
        fields = [
            'id', 'profile', 'profile_name', 'profile_email',
            'id_type', 'id_number', 'document_front', 'document_back',
            'status', 'rejection_reason', 'submitted_at', 'verified_at'
        ]


class AdminReportSerializer(serializers.ModelSerializer):
    """Serializer for report management."""
    
    reporter_name = serializers.CharField(source='reporter.full_name', read_only=True)
    reported_name = serializers.CharField(source='reported_profile.full_name', read_only=True)
    
    class Meta:
        model = Report
        fields = [
            'id', 'reporter', 'reporter_name', 'reported_profile', 'reported_name',
            'report_type', 'description', 'screenshot',
            'status', 'action_taken', 'resolution_notes',
            'created_at', 'resolved_at'
        ]


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for admin dashboard stats."""
    
    total_users = serializers.IntegerField()
    active_users = serializers.IntegerField()
    pending_approvals = serializers.IntegerField()
    pending_verifications = serializers.IntegerField()
    pending_reports = serializers.IntegerField()
    total_premium = serializers.IntegerField()
    total_matches = serializers.IntegerField()
    revenue_this_month = serializers.IntegerField()
