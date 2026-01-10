"""
Serializers for reports app.
"""

from rest_framework import serializers
from profiles.serializers import ProfileListSerializer
from .models import Report, Feedback


class ReportSerializer(serializers.ModelSerializer):
    """Serializer for reports."""
    
    reporter = ProfileListSerializer(read_only=True)
    reported_profile = ProfileListSerializer(read_only=True)
    
    class Meta:
        model = Report
        fields = [
            'id', 'reporter', 'reported_profile', 'report_type',
            'description', 'screenshot', 'status', 'action_taken',
            'created_at', 'resolved_at'
        ]
        read_only_fields = ['id', 'reporter', 'status', 'action_taken', 'created_at', 'resolved_at']


class ReportCreateSerializer(serializers.Serializer):
    """Serializer for creating a report."""
    
    profile_id = serializers.UUIDField()
    report_type = serializers.ChoiceField(choices=Report.REPORT_TYPE_CHOICES)
    description = serializers.CharField(max_length=2000)
    screenshot = serializers.ImageField(required=False)


class FeedbackSerializer(serializers.ModelSerializer):
    """Serializer for feedback."""
    
    class Meta:
        model = Feedback
        fields = [
            'id', 'feedback_type', 'subject', 'message',
            'screenshot', 'is_read', 'response', 'responded_at',
            'created_at'
        ]
        read_only_fields = ['id', 'is_read', 'response', 'responded_at', 'created_at']


class FeedbackCreateSerializer(serializers.Serializer):
    """Serializer for creating feedback."""
    
    feedback_type = serializers.ChoiceField(choices=Feedback.FEEDBACK_TYPE_CHOICES)
    subject = serializers.CharField(max_length=200)
    message = serializers.CharField(max_length=5000)
    screenshot = serializers.ImageField(required=False)
