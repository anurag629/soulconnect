"""
Chat Models for KSHATRIYAConnect.

Models for private messaging between matched users.
"""

import uuid
from django.db import models
from django.conf import settings
from profiles.models import Profile
from matching.models import Match


class Conversation(models.Model):
    """
    Conversation between two matched users.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    match = models.OneToOneField(
        Match,
        on_delete=models.CASCADE,
        related_name='conversation'
    )
    
    # Participants (for easier querying)
    participant1 = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='conversations_as_p1'
    )
    participant2 = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='conversations_as_p2'
    )
    
    # Conversation state
    is_active = models.BooleanField(default=True)
    
    # Last message for preview
    last_message = models.TextField(blank=True)
    last_message_at = models.DateTimeField(null=True, blank=True)
    last_message_by = models.ForeignKey(
        Profile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='last_messages'
    )
    
    # Unread counts
    unread_count_p1 = models.PositiveIntegerField(default=0)
    unread_count_p2 = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'conversation'
        verbose_name_plural = 'conversations'
        ordering = ['-last_message_at', '-created_at']
    
    def __str__(self):
        return f"Chat: {self.participant1.full_name} & {self.participant2.full_name}"
    
    def get_other_participant(self, profile):
        """Get the other participant in the conversation."""
        if self.participant1 == profile:
            return self.participant2
        return self.participant1
    
    def get_unread_count(self, profile):
        """Get unread count for a participant."""
        if self.participant1 == profile:
            return self.unread_count_p1
        return self.unread_count_p2
    
    def increment_unread(self, for_profile):
        """Increment unread count for a participant."""
        if self.participant1 == for_profile:
            self.unread_count_p1 += 1
        else:
            self.unread_count_p2 += 1
        self.save(update_fields=['unread_count_p1', 'unread_count_p2'])
    
    def mark_as_read(self, by_profile):
        """Mark all messages as read for a participant."""
        if self.participant1 == by_profile:
            self.unread_count_p1 = 0
        else:
            self.unread_count_p2 = 0
        self.save(update_fields=['unread_count_p1', 'unread_count_p2'])
        
        # Mark individual messages as read
        Message.objects.filter(
            conversation=self,
            is_read=False
        ).exclude(sender=by_profile).update(is_read=True)


class Message(models.Model):
    """
    Individual message in a conversation.
    """
    
    MESSAGE_TYPE_CHOICES = [
        ('text', 'Text'),
        ('image', 'Image'),
        ('system', 'System Message'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='messages_sent'
    )
    
    # Message content
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPE_CHOICES, default='text')
    content = models.TextField(max_length=5000)
    
    # For image messages
    image = models.ImageField(upload_to='chat_images/%Y/%m/', blank=True, null=True)
    
    # Status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Soft delete
    is_deleted_by_sender = models.BooleanField(default=False)
    is_deleted_by_receiver = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'message'
        verbose_name_plural = 'messages'
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.sender.full_name}: {self.content[:50]}"
    
    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        
        if is_new:
            # Update conversation
            self.conversation.last_message = self.content[:100]
            self.conversation.last_message_at = self.created_at
            self.conversation.last_message_by = self.sender
            self.conversation.save(update_fields=[
                'last_message', 'last_message_at', 'last_message_by'
            ])
            
            # Increment unread count for the other participant
            other = self.conversation.get_other_participant(self.sender)
            self.conversation.increment_unread(other)


class ChatRequest(models.Model):
    """
    Request to start a chat (for non-premium users).
    Premium users can chat directly with matches.
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
        related_name='chat_requests_sent'
    )
    to_profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='chat_requests_received'
    )
    match = models.ForeignKey(
        Match,
        on_delete=models.CASCADE,
        related_name='chat_requests'
    )
    
    message = models.TextField(max_length=500, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'chat request'
        verbose_name_plural = 'chat requests'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.from_profile.full_name} → {self.to_profile.full_name}"
    
    def accept(self):
        """Accept chat request and unlock chat."""
        from django.utils import timezone
        
        self.status = 'accepted'
        self.responded_at = timezone.now()
        self.save()
        
        # Unlock chat on the match
        self.match.chat_unlocked = True
        self.match.chat_unlocked_at = timezone.now()
        self.match.save(update_fields=['chat_unlocked', 'chat_unlocked_at'])
        
        # Create conversation if not exists
        Conversation.objects.get_or_create(
            match=self.match,
            defaults={
                'participant1': self.match.profile1,
                'participant2': self.match.profile2,
            }
        )
    
    def decline(self):
        """Decline chat request."""
        from django.utils import timezone
        
        self.status = 'declined'
        self.responded_at = timezone.now()
        self.save()
