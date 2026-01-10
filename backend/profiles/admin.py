"""
Admin configuration for profiles app.
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import Profile, PartnerPreference, ProfilePhoto, GovernmentID, ProfileView, BlockedProfile


class ProfilePhotoInline(admin.TabularInline):
    model = ProfilePhoto
    extra = 0
    readonly_fields = ['uploaded_at', 'image_preview']
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="100" />', obj.image.url)
        return "-"
    image_preview.short_description = "Preview"


class PartnerPreferenceInline(admin.StackedInline):
    model = PartnerPreference
    extra = 0


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = [
        'full_name', 'gender', 'age', 'religion', 'city', 'state',
        'get_user_status', 'profile_score', 'created_at'
    ]
    list_filter = [
        'gender', 'religion', 'marital_status', 'education',
        'user__is_profile_approved', 'user__is_id_verified',
        'created_at'
    ]
    search_fields = ['full_name', 'user__email', 'city', 'state', 'caste']
    readonly_fields = ['profile_views', 'profile_score', 'created_at', 'updated_at']
    inlines = [ProfilePhotoInline, PartnerPreferenceInline]
    
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Basic Info', {'fields': ('full_name', 'gender', 'date_of_birth')}),
        ('Physical', {'fields': ('height_cm', 'body_type', 'complexion')}),
        ('Personal', {'fields': (
            'marital_status', 'religion', 'caste', 'sub_caste', 'mother_tongue'
        )}),
        ('Education & Career', {'fields': (
            'education', 'education_detail', 'profession', 'company_name', 'annual_income'
        )}),
        ('Location', {'fields': ('city', 'state', 'country', 'pincode')}),
        ('Family', {'fields': (
            'father_name', 'father_occupation', 'mother_name', 'mother_occupation',
            'siblings', 'family_type', 'family_values'
        )}),
        ('Lifestyle', {'fields': ('diet', 'smoking', 'drinking')}),
        ('Horoscope', {'fields': ('manglik', 'star_sign', 'birth_time', 'birth_place')}),
        ('About', {'fields': ('about_me',)}),
        ('Contact', {'fields': ('phone_number', 'whatsapp_number')}),
        ('Stats', {'fields': ('profile_views', 'profile_score')}),
        ('Dates', {'fields': ('created_at', 'updated_at')}),
    )
    
    def get_user_status(self, obj):
        badges = []
        if obj.user.is_profile_approved:
            badges.append('✓ Approved')
        else:
            badges.append('⏳ Pending')
        if obj.user.is_id_verified:
            badges.append('🆔 Verified')
        if obj.user.is_premium:
            badges.append('⭐ Premium')
        return ' | '.join(badges)
    get_user_status.short_description = 'Status'


@admin.register(ProfilePhoto)
class ProfilePhotoAdmin(admin.ModelAdmin):
    list_display = ['profile', 'is_primary', 'is_approved', 'is_rejected', 'uploaded_at']
    list_filter = ['is_primary', 'is_approved', 'is_rejected', 'uploaded_at']
    search_fields = ['profile__full_name', 'profile__user__email']
    actions = ['approve_photos', 'reject_photos']
    
    @admin.action(description='Approve selected photos')
    def approve_photos(self, request, queryset):
        queryset.update(is_approved=True, is_rejected=False)
    
    @admin.action(description='Reject selected photos')
    def reject_photos(self, request, queryset):
        queryset.update(is_rejected=True, is_approved=False)


@admin.register(GovernmentID)
class GovernmentIDAdmin(admin.ModelAdmin):
    list_display = ['profile', 'id_type', 'status', 'submitted_at', 'verified_at']
    list_filter = ['id_type', 'status', 'submitted_at']
    search_fields = ['profile__full_name', 'profile__user__email', 'id_number']
    actions = ['verify_ids', 'reject_ids']
    
    @admin.action(description='Verify selected IDs')
    def verify_ids(self, request, queryset):
        from django.utils import timezone
        for gov_id in queryset:
            gov_id.status = 'verified'
            gov_id.verified_by = request.user
            gov_id.verified_at = timezone.now()
            gov_id.save()
            
            # Mark user as ID verified
            gov_id.profile.user.is_id_verified = True
            gov_id.profile.user.save(update_fields=['is_id_verified'])
    
    @admin.action(description='Reject selected IDs')
    def reject_ids(self, request, queryset):
        queryset.update(status='rejected')


@admin.register(ProfileView)
class ProfileViewAdmin(admin.ModelAdmin):
    list_display = ['viewer', 'viewed_profile', 'viewed_at']
    list_filter = ['viewed_at']
    search_fields = ['viewer__full_name', 'viewed_profile__full_name']


@admin.register(BlockedProfile)
class BlockedProfileAdmin(admin.ModelAdmin):
    list_display = ['blocker', 'blocked', 'blocked_at']
    list_filter = ['blocked_at']
    search_fields = ['blocker__full_name', 'blocked__full_name']
