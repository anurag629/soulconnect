"""
Custom User Model for KSHATRIYAConnect.

Extends Django's AbstractUser to support email-based authentication
and additional fields required for a matrimonial platform.
"""

import uuid
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    """
    Custom user manager where email is the unique identifier
    for authentication instead of username.
    """
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular User with the given email and password."""
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a SuperUser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_email_verified', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Custom User model for KSHATRIYAConnect matrimonial platform.
    
    Uses email as the primary identifier instead of username.
    Includes fields for verification status and account management.
    """
    
    # Remove username field, use email instead
    username = None
    
    # Primary identifier
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField('email address', unique=True, db_index=True)
    
    # Account status
    is_email_verified = models.BooleanField(
        'email verified',
        default=False,
        help_text='Designates whether this user has verified their email.'
    )
    is_profile_complete = models.BooleanField(
        'profile complete',
        default=False,
        help_text='Designates whether this user has completed their profile.'
    )
    is_profile_approved = models.BooleanField(
        'profile approved',
        default=False,
        help_text='Designates whether this user profile has been approved by admin.'
    )
    is_id_verified = models.BooleanField(
        'ID verified',
        default=False,
        help_text='Designates whether this user has verified their government ID.'
    )
    is_premium = models.BooleanField(
        'premium member',
        default=False,
        help_text='Designates whether this user has an active premium subscription.'
    )
    is_banned = models.BooleanField(
        'banned',
        default=False,
        help_text='Designates whether this user has been banned.'
    )
    ban_reason = models.TextField(blank=True, null=True)
    
    # Manager role
    is_manager = models.BooleanField(
        'manager',
        default=False,
        help_text='Designates whether this user is a manager with access to search and profile management.'
    )
    
    # Verification tokens
    email_verification_token = models.CharField(max_length=100, blank=True, null=True)
    email_verification_sent_at = models.DateTimeField(blank=True, null=True)
    password_reset_token = models.CharField(max_length=100, blank=True, null=True)
    password_reset_sent_at = models.DateTimeField(blank=True, null=True)
    
    # Tracking
    last_active = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Use email as username field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    objects = UserManager()
    
    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.email
    
    def update_last_active(self):
        """Update the last_active timestamp."""
        self.last_active = timezone.now()
        self.save(update_fields=['last_active'])
    
    @property
    def is_fully_verified(self):
        """Check if user is fully verified (email + ID)."""
        return self.is_email_verified and self.is_id_verified
    
    @property
    def can_access_platform(self):
        """Check if user can access the platform features."""
        return (
            self.is_active and 
            not self.is_banned and 
            self.is_email_verified and 
            self.is_profile_complete and 
            self.is_profile_approved
        )
    
    @property
    def is_manager_user(self):
        """Check if user is a manager."""
        return self.is_manager and self.is_active


class EmailVerificationToken(models.Model):
    """
    Model to store email verification tokens.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_tokens')
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
    
    def is_valid(self):
        """Check if token is still valid."""
        return not self.is_used and self.expires_at > timezone.now()


class PasswordResetToken(models.Model):
    """
    Model to store password reset tokens.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_tokens')
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
    
    def is_valid(self):
        """Check if token is still valid."""
        return not self.is_used and self.expires_at > timezone.now()
