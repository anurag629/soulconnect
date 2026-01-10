"""
Signals for accounts app.

Automatically creates a Profile when a new User is created.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Create a Profile for newly created users.
    """
    if created:
        from profiles.models import Profile
        from datetime import date
        
        # Check if profile already exists
        if not hasattr(instance, 'profile') or instance.profile is None:
            try:
                # Create a minimal profile with placeholder data
                # User will complete their profile later
                Profile.objects.create(
                    user=instance,
                    full_name=f"{instance.first_name} {instance.last_name}".strip() or "New User",
                    gender='M',  # Default, will be updated by user
                    date_of_birth=date(1990, 1, 1),  # Placeholder, will be updated
                    height_cm=170,  # Default placeholder
                    marital_status='never_married',
                    religion='hindu',
                    mother_tongue='Hindi',
                    education='bachelors',
                    profession='Professional',
                    annual_income='5-10',
                    city='Mumbai',
                    state='Maharashtra',
                    country='India',
                    about_me='Welcome to my profile!',
                )
                
                # Auto-approve profiles in development mode
                if settings.DEBUG:
                    instance.is_profile_approved = True
                    instance.save(update_fields=['is_profile_approved'])
                    
            except Exception as e:
                # Log the error but don't fail user creation
                print(f"[WARNING] Could not create profile for user {instance.email}: {e}")
