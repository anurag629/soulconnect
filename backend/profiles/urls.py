"""
URL configuration for profiles app.
"""

from django.urls import path
from .views import (
    ProfileCreateView, MyProfileView, ProfileDetailView, ProfileSearchView,
    PartnerPreferenceView, PhotoUploadView, PhotoDeleteView, SetPrimaryPhotoView,
    GovernmentIDSubmitView, GovernmentIDListView, ProfileViewsListView,
    BlockProfileView, UnblockProfileView, BlockedProfilesListView
)

app_name = 'profiles'

urlpatterns = [
    # Profile CRUD
    path('create/', ProfileCreateView.as_view(), name='profile_create'),
    path('me/', MyProfileView.as_view(), name='my_profile'),
    path('<uuid:id>/', ProfileDetailView.as_view(), name='profile_detail'),
    path('search/', ProfileSearchView.as_view(), name='profile_search'),
    
    # Partner Preferences
    path('preferences/', PartnerPreferenceView.as_view(), name='partner_preferences'),
    
    # Photos
    path('photos/upload/', PhotoUploadView.as_view(), name='photo_upload'),
    path('photos/<uuid:photo_id>/delete/', PhotoDeleteView.as_view(), name='photo_delete'),
    path('photos/<uuid:photo_id>/set-primary/', SetPrimaryPhotoView.as_view(), name='set_primary_photo'),
    
    # Government ID
    path('verification/submit/', GovernmentIDSubmitView.as_view(), name='submit_verification'),
    path('verification/list/', GovernmentIDListView.as_view(), name='list_verification'),
    
    # Profile Views (Who viewed me)
    path('views/', ProfileViewsListView.as_view(), name='profile_views'),
    
    # Block/Unblock
    path('<uuid:profile_id>/block/', BlockProfileView.as_view(), name='block_profile'),
    path('<uuid:profile_id>/unblock/', UnblockProfileView.as_view(), name='unblock_profile'),
    path('blocked/', BlockedProfilesListView.as_view(), name='blocked_profiles'),
]
