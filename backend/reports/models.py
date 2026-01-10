"""
Report Models for SoulConnect.

Models for reporting inappropriate users/content.
"""

import uuid
from django.db import models
from django.conf import settings
from profiles.models import Profile


class Report(models.Model):
    """
    User report model for reporting inappropriate profiles/behavior.
    """
    
    REPORT_TYPE_CHOICES = [
        ('fake_profile', 'Fake Profile'),
        ('inappropriate_photos', 'Inappropriate Photos'),
        ('harassment', 'Harassment'),
        ('scam', 'Scam/Fraud'),
        ('abusive_language', 'Abusive Language'),
        ('impersonation', 'Impersonation'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('under_review', 'Under Review'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    ]
    
    ACTION_CHOICES = [
        ('none', 'No Action'),
        ('warning', 'Warning Issued'),
        ('photo_removed', 'Photo Removed'),
        ('profile_suspended', 'Profile Suspended'),
        ('account_banned', 'Account Banned'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Reporter
    reporter = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='reports_submitted'
    )
    
    # Reported profile
    reported_profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='reports_received'
    )
    
    # Report details
    report_type = models.CharField(max_length=30, choices=REPORT_TYPE_CHOICES)
    description = models.TextField(max_length=2000)
    
    # Evidence (optional)
    screenshot = models.ImageField(upload_to='reports/%Y/%m/', blank=True, null=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Resolution
    action_taken = models.CharField(
        max_length=30,
        choices=ACTION_CHOICES,
        default='none',
        blank=True
    )
    resolution_notes = models.TextField(blank=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reports_resolved'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'report'
        verbose_name_plural = 'reports'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.reporter.full_name} reported {self.reported_profile.full_name}"


class Feedback(models.Model):
    """
    User feedback model.
    """
    
    FEEDBACK_TYPE_CHOICES = [
        ('bug', 'Bug Report'),
        ('feature', 'Feature Request'),
        ('complaint', 'Complaint'),
        ('suggestion', 'Suggestion'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='feedback'
    )
    
    feedback_type = models.CharField(max_length=20, choices=FEEDBACK_TYPE_CHOICES)
    subject = models.CharField(max_length=200)
    message = models.TextField(max_length=5000)
    
    # Optional screenshot
    screenshot = models.ImageField(upload_to='feedback/%Y/%m/', blank=True, null=True)
    
    # Response
    is_read = models.BooleanField(default=False)
    response = models.TextField(blank=True)
    responded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='feedback_responses'
    )
    responded_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'feedback'
        verbose_name_plural = 'feedback'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.subject[:50]}"
