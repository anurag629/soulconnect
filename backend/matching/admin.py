"""
Admin configuration for matching app.
"""

from django.contrib import admin
from .models import Like, Pass, Match, InterestRequest, Shortlist


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ['from_profile', 'to_profile', 'like_type', 'created_at']
    list_filter = ['like_type', 'created_at']
    search_fields = ['from_profile__full_name', 'to_profile__full_name']


@admin.register(Pass)
class PassAdmin(admin.ModelAdmin):
    list_display = ['from_profile', 'to_profile', 'created_at']
    list_filter = ['created_at']
    search_fields = ['from_profile__full_name', 'to_profile__full_name']


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ['profile1', 'profile2', 'status', 'matched_at', 'chat_unlocked']
    list_filter = ['status', 'chat_unlocked', 'matched_at']
    search_fields = ['profile1__full_name', 'profile2__full_name']


@admin.register(InterestRequest)
class InterestRequestAdmin(admin.ModelAdmin):
    list_display = ['from_profile', 'to_profile', 'status', 'created_at', 'responded_at']
    list_filter = ['status', 'created_at']
    search_fields = ['from_profile__full_name', 'to_profile__full_name']


@admin.register(Shortlist)
class ShortlistAdmin(admin.ModelAdmin):
    list_display = ['profile', 'shortlisted_profile', 'created_at']
    list_filter = ['created_at']
    search_fields = ['profile__full_name', 'shortlisted_profile__full_name']
