"""
Signals for accounts app.

Profile creation is now handled in the registration view to use actual user data.
This signal is kept as a fallback for admin-created users or edge cases.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Fallback: Create a Profile for users who don't have one.
    Primary profile creation happens in RegisterView with actual user data.
    """
    if created:
        from profiles.models import Profile

        # Check if profile already exists (it should, if created via RegisterView)
        try:
            # Try to access the profile - will raise exception if doesn't exist
            _ = instance.profile
        except Profile.DoesNotExist:
            # Only create fallback profile for admin-created users or edge cases
            from datetime import date
            try:
                Profile.objects.create(
                    user=instance,
                    full_name=f"{instance.first_name} {instance.last_name}".strip() or "New User",
                    gender='M',
                    date_of_birth=date(1990, 1, 1),
                    height_cm=170,
                    marital_status='never_married',
                    religion='hindu',
                    education='bachelors',
                    profession='Not specified',
                    annual_income='5-10',
                    city='Not specified',
                    state='Not specified',
                    country='India',
                    diet='vegetarian',
                    about_me='',
                )

                if settings.DEBUG:
                    instance.is_profile_approved = True
                    instance.save(update_fields=['is_profile_approved'])

            except Exception as e:
                print(f"[WARNING] Could not create fallback profile for {instance.email}: {e}")
