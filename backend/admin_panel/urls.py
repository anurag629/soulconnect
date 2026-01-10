"""
URL configuration for admin panel.
"""

from django.urls import path
from .views import (
    AdminDashboardView,
    PendingApprovalsView, ApproveProfileView, RejectProfileView,
    PendingPhotosView, ApprovePhotoView, RejectPhotoView,
    PendingVerificationsView, VerifyIDView, RejectIDView,
    ReportsListView, ResolveReportView,
    UserManagementView, BanUserView, UnbanUserView,
    SubscriptionStatsView
)

app_name = 'admin_panel'

urlpatterns = [
    # Dashboard
    path('dashboard/', AdminDashboardView.as_view(), name='dashboard'),
    
    # Profile Approvals
    path('approvals/', PendingApprovalsView.as_view(), name='pending_approvals'),
    path('approvals/<uuid:profile_id>/approve/', ApproveProfileView.as_view(), name='approve_profile'),
    path('approvals/<uuid:profile_id>/reject/', RejectProfileView.as_view(), name='reject_profile'),
    
    # Photo Moderation
    path('photos/', PendingPhotosView.as_view(), name='pending_photos'),
    path('photos/<uuid:photo_id>/approve/', ApprovePhotoView.as_view(), name='approve_photo'),
    path('photos/<uuid:photo_id>/reject/', RejectPhotoView.as_view(), name='reject_photo'),
    
    # ID Verification
    path('verifications/', PendingVerificationsView.as_view(), name='pending_verifications'),
    path('verifications/<uuid:id>/verify/', VerifyIDView.as_view(), name='verify_id'),
    path('verifications/<uuid:id>/reject/', RejectIDView.as_view(), name='reject_id'),
    
    # Reports
    path('reports/', ReportsListView.as_view(), name='reports'),
    path('reports/<uuid:report_id>/resolve/', ResolveReportView.as_view(), name='resolve_report'),
    
    # User Management
    path('users/', UserManagementView.as_view(), name='user_management'),
    path('users/<uuid:user_id>/ban/', BanUserView.as_view(), name='ban_user'),
    path('users/<uuid:user_id>/unban/', UnbanUserView.as_view(), name='unban_user'),
    
    # Stats
    path('subscriptions/stats/', SubscriptionStatsView.as_view(), name='subscription_stats'),
]
