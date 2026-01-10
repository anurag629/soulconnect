"""
Admin configuration for accounts app.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, EmailVerificationToken, PasswordResetToken


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Admin configuration for custom User model.
    """
    list_display = [
        'email', 'first_name', 'last_name', 'is_email_verified',
        'is_profile_complete', 'is_profile_approved', 'is_premium',
        'is_banned', 'is_active', 'created_at'
    ]
    list_filter = [
        'is_email_verified', 'is_profile_complete', 'is_profile_approved',
        'is_id_verified', 'is_premium', 'is_banned', 'is_active', 'is_staff'
    ]
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name')}),
        ('Verification Status', {
            'fields': (
                'is_email_verified', 'is_profile_complete',
                'is_profile_approved', 'is_id_verified'
            )
        }),
        ('Subscription', {'fields': ('is_premium',)}),
        ('Account Status', {'fields': ('is_active', 'is_banned', 'ban_reason')}),
        ('Permissions', {'fields': ('is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important Dates', {'fields': ('last_login', 'last_active', 'created_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'first_name', 'last_name'),
        }),
    )
    
    readonly_fields = ['last_login', 'last_active', 'created_at']


@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'token', 'created_at', 'expires_at', 'is_used']
    list_filter = ['is_used', 'created_at']
    search_fields = ['user__email', 'token']
    readonly_fields = ['created_at']


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'token', 'created_at', 'expires_at', 'is_used']
    list_filter = ['is_used', 'created_at']
    search_fields = ['user__email', 'token']
    readonly_fields = ['created_at']
