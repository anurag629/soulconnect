"""
Matching Models for SoulConnect.

Models for likes, matches, and interest expressions.
"""

import uuid
from django.db import models
from django.conf import settings
from profiles.models import Profile


class Like(models.Model):
    """
    Model to track when a user likes another profile.
    When both users like each other, a Match is created.
    """
    
    LIKE_TYPE_CHOICES = [
        ('like', 'Like'),
        ('super_like', 'Super Like'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    from_profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='likes_sent'
    )
    to_profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='likes_received'
    )
    
    like_type = models.CharField(max_length=20, choices=LIKE_TYPE_CHOICES, default='like')
    message = models.TextField(max_length=500, blank=True, help_text="Optional message with the like")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'like'
        verbose_name_plural = 'likes'
        unique_together = ['from_profile', 'to_profile']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.from_profile.full_name} → {self.to_profile.full_name}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        
        # Check for mutual like and create match
        mutual_like = Like.objects.filter(
            from_profile=self.to_profile,
            to_profile=self.from_profile
        ).exists()
        
        if mutual_like:
            # Create match if doesn't exist
            Match.objects.get_or_create(
                profile1=min(self.from_profile, self.to_profile, key=lambda p: str(p.id)),
                profile2=max(self.from_profile, self.to_profile, key=lambda p: str(p.id)),
            )


class Pass(models.Model):
    """
    Model to track when a user passes (skips) a profile.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    from_profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='passes_sent'
    )
    to_profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='passes_received'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'pass'
        verbose_name_plural = 'passes'
        unique_together = ['from_profile', 'to_profile']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.from_profile.full_name} passed {self.to_profile.full_name}"


class Match(models.Model):
    """
    Model for mutual matches.
    Created automatically when two users like each other.
    """
    
    MATCH_STATUS_CHOICES = [
        ('active', 'Active'),
        ('archived', 'Archived'),
        ('unmatched', 'Unmatched'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Use alphabetically ordered profiles to ensure uniqueness
    profile1 = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='matches_as_profile1'
    )
    profile2 = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='matches_as_profile2'
    )
    
    status = models.CharField(max_length=20, choices=MATCH_STATUS_CHOICES, default='active')
    
    # Track who unmatched (if applicable)
    unmatched_by = models.ForeignKey(
        Profile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='unmatched_connections'
    )
    
    matched_at = models.DateTimeField(auto_now_add=True)
    unmatched_at = models.DateTimeField(null=True, blank=True)
    
    # Chat unlock status
    chat_unlocked = models.BooleanField(default=False)
    chat_unlocked_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'match'
        verbose_name_plural = 'matches'
        unique_together = ['profile1', 'profile2']
        ordering = ['-matched_at']
    
    def __str__(self):
        return f"{self.profile1.full_name} ♥ {self.profile2.full_name}"
    
    def get_other_profile(self, profile):
        """Get the other profile in the match."""
        if self.profile1 == profile:
            return self.profile2
        return self.profile1
    
    def unmatch(self, profile):
        """Unmatch from a connection."""
        from django.utils import timezone
        self.status = 'unmatched'
        self.unmatched_by = profile
        self.unmatched_at = timezone.now()
        self.save()


class InterestRequest(models.Model):
    """
    Model for sending interest requests (more formal than likes).
    Commonly used in Indian matrimonial platforms.
    """
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    from_profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='interests_sent'
    )
    to_profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='interests_received'
    )
    
    message = models.TextField(max_length=1000, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'interest request'
        verbose_name_plural = 'interest requests'
        unique_together = ['from_profile', 'to_profile']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.from_profile.full_name} → {self.to_profile.full_name} ({self.status})"
    
    def accept(self):
        """Accept the interest request."""
        from django.utils import timezone
        self.status = 'accepted'
        self.responded_at = timezone.now()
        self.save()
        
        # Create mutual likes
        Like.objects.get_or_create(
            from_profile=self.from_profile,
            to_profile=self.to_profile
        )
        Like.objects.get_or_create(
            from_profile=self.to_profile,
            to_profile=self.from_profile
        )
    
    def decline(self):
        """Decline the interest request."""
        from django.utils import timezone
        self.status = 'declined'
        self.responded_at = timezone.now()
        self.save()


class Shortlist(models.Model):
    """
    Model for shortlisted profiles.
    Users can shortlist profiles they're interested in.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='shortlisted_by'
    )
    shortlisted_profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='shortlisted_in'
    )
    
    notes = models.TextField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'shortlist'
        verbose_name_plural = 'shortlists'
        unique_together = ['profile', 'shortlisted_profile']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.profile.full_name} shortlisted {self.shortlisted_profile.full_name}"
