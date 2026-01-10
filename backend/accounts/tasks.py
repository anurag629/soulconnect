"""
Celery tasks for accounts app.

Async tasks for sending emails.
In development mode without Redis, falls back to synchronous execution.
"""

import os
from django.conf import settings
from django.core.mail import send_mail


# Check if we're running in development mode (without Celery)
CELERY_AVAILABLE = False
shared_task = None

try:
    from celery import shared_task as celery_shared_task
    CELERY_AVAILABLE = True
    shared_task = celery_shared_task
except ImportError:
    pass


class TaskWrapper:
    """Wrapper to allow .delay() calls in development."""
    def __init__(self, func):
        self.func = func
    
    def __call__(self, *args, **kwargs):
        return self.func(*args, **kwargs)
    
    def delay(self, *args, **kwargs):
        return self.func(*args, **kwargs)
    
    def apply_async(self, args=None, kwargs=None, **options):
        return self.func(*(args or ()), **(kwargs or {}))


def _send_verification_email_impl(user_id: str, token: str):
    """
    Send email verification link to user.
    
    Args:
        user_id: UUID of the user
        token: Verification token
    """
    from .models import User
    
    try:
        user = User.objects.get(id=user_id)
        
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        
        subject = "Verify your SoulConnect account"
        message = f"""
Hello {user.first_name},

Thank you for registering on SoulConnect - India's Premium Matrimonial Platform.

Please verify your email by clicking the link below:
{verification_url}

This link will expire in 24 hours.

If you didn't create an account on SoulConnect, please ignore this email.

Best regards,
The SoulConnect Team
"""
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        print(f"[EMAIL] Verification email sent to {user.email}")
        return f"Verification email sent to {user.email}"
        
    except User.DoesNotExist:
        print(f"[EMAIL ERROR] User {user_id} not found")
        return f"User {user_id} not found"
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send verification email: {str(e)}")
        return f"Failed to send verification email: {str(e)}"


def _send_password_reset_email_impl(user_id: str, token: str):
    """
    Send password reset link to user.
    
    Args:
        user_id: UUID of the user
        token: Password reset token
    """
    from .models import User
    
    try:
        user = User.objects.get(id=user_id)
        
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        
        subject = "Reset your SoulConnect password"
        message = f"""
Hello {user.first_name},

We received a request to reset your password for your SoulConnect account.

Click the link below to reset your password:
{reset_url}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email or contact our support team.

Best regards,
The SoulConnect Team
"""
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        print(f"[EMAIL] Password reset email sent to {user.email}")
        return f"Password reset email sent to {user.email}"
        
    except User.DoesNotExist:
        print(f"[EMAIL ERROR] User {user_id} not found")
        return f"User {user_id} not found"
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send password reset email: {str(e)}")
        return f"Failed to send password reset email: {str(e)}"


def _send_welcome_email_impl(user_id: str):
    """
    Send welcome email after successful registration.
    
    Args:
        user_id: UUID of the user
    """
    from .models import User
    
    try:
        user = User.objects.get(id=user_id)
        
        subject = "Welcome to SoulConnect - Begin Your Journey"
        message = f"""
Hello {user.first_name},

Welcome to SoulConnect - India's Premium Matrimonial Platform!

We're thrilled to have you join our community of verified, serious individuals 
looking for meaningful life partnerships.

Here's how to get started:
1. Complete your profile with accurate information
2. Upload clear, recent photos
3. Set your partner preferences
4. Start exploring compatible matches

Our platform is designed to help you find your perfect life partner while 
maintaining the highest standards of privacy and security.

If you have any questions, our support team is always here to help.

Best wishes on your journey,
The SoulConnect Team
"""
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        print(f"[EMAIL] Welcome email sent to {user.email}")
        return f"Welcome email sent to {user.email}"
        
    except User.DoesNotExist:
        print(f"[EMAIL ERROR] User {user_id} not found")
        return f"User {user_id} not found"
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send welcome email: {str(e)}")
        return f"Failed to send welcome email: {str(e)}"


def _send_match_notification_impl(user_id: str, matched_user_id: str):
    """
    Send notification when a new match is created.
    
    Args:
        user_id: UUID of the user to notify
        matched_user_id: UUID of the matched user
    """
    from .models import User
    
    try:
        user = User.objects.get(id=user_id)
        matched_user = User.objects.get(id=matched_user_id)
        
        subject = "You have a new match on SoulConnect!"
        message = f"""
Hello {user.first_name},

Great news! You have a new match on SoulConnect!

{matched_user.first_name} has shown interest in you, and the feeling is mutual!

Log in to SoulConnect to start a conversation and get to know each other better.

Remember, meaningful connections take time. Be respectful, be genuine, and 
enjoy the journey of getting to know someone new.

Best wishes,
The SoulConnect Team
"""
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        print(f"[EMAIL] Match notification sent to {user.email}")
        return f"Match notification sent to {user.email}"
        
    except User.DoesNotExist as e:
        print(f"[EMAIL ERROR] User not found: {e}")
        return f"User not found"
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send match notification: {str(e)}")
        return f"Failed to send match notification: {str(e)}"


# Create the task objects - either Celery tasks or sync wrappers
if CELERY_AVAILABLE and shared_task is not None:
    send_verification_email = shared_task(_send_verification_email_impl)
    send_password_reset_email = shared_task(_send_password_reset_email_impl)
    send_welcome_email = shared_task(_send_welcome_email_impl)
    send_match_notification = shared_task(_send_match_notification_impl)
else:
    # Development mode - use synchronous execution
    send_verification_email = TaskWrapper(_send_verification_email_impl)
    send_password_reset_email = TaskWrapper(_send_password_reset_email_impl)
    send_welcome_email = TaskWrapper(_send_welcome_email_impl)
    send_match_notification = TaskWrapper(_send_match_notification_impl)
