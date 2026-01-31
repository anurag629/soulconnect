"""
URL configuration for profiles app.
"""

from django.urls import path
from .views import (
    ProfileCreateView, MyProfileView, ProfileDetailView, ProfileSearchView,
    PartnerPreferenceView, PhotoUploadView, PhotoDeleteView, SetPrimaryPhotoView,
    GovernmentIDSubmitView,
    ProfilePaymentSubmitView, ProfilePaymentStatusView, ProfilePaymentListView,
    ManagerProfileDownloadView,
    ManagerDashboardView, ManagerPendingProfilesView,
    ManagerApproveProfileView, ManagerRejectProfileView,
    ManagerPendingPaymentsView, ManagerVerifyPaymentView, ManagerRejectPaymentView,
)

app_name = 'profiles'

urlpatterns = [
    # Profile CRUD
    path('create/', ProfileCreateView.as_view(), name='profile_create'),
    path('me/', MyProfileView.as_view(), name='my_profile'),
    path('<uuid:id>/', ProfileDetailView.as_view(), name='profile_detail'),
    
    # Partner Preferences
    path('preferences/', PartnerPreferenceView.as_view(), name='partner_preferences'),
    
    # Photos
    path('photos/upload/', PhotoUploadView.as_view(), name='photo_upload'),
    path('photos/<uuid:photo_id>/delete/', PhotoDeleteView.as_view(), name='photo_delete'),
    path('photos/<uuid:photo_id>/set-primary/', SetPrimaryPhotoView.as_view(), name='set_primary_photo'),
    
    # Government ID
    path('verification/submit/', GovernmentIDSubmitView.as_view(), name='submit_verification'),
    
    # Profile Payment
    path('payment/submit/', ProfilePaymentSubmitView.as_view(), name='payment_submit'),
    path('payment/status/', ProfilePaymentStatusView.as_view(), name='payment_status'),
    path('payment/history/', ProfilePaymentListView.as_view(), name='payment_history'),
    
    # Manager-only endpoints
    path('manager/search/', ProfileSearchView.as_view(), name='manager_search'),
    path('manager/download/<uuid:profile_id>/', ManagerProfileDownloadView.as_view(), name='manager_download'),
    path('manager/dashboard/', ManagerDashboardView.as_view(), name='manager_dashboard'),
    path('manager/pending/', ManagerPendingProfilesView.as_view(), name='manager_pending_profiles'),
    path('manager/pending/<uuid:pk>/approve/', ManagerApproveProfileView.as_view(), name='manager_approve_profile'),
    path('manager/pending/<uuid:pk>/reject/', ManagerRejectProfileView.as_view(), name='manager_reject_profile'),
    path('manager/payments/', ManagerPendingPaymentsView.as_view(), name='manager_pending_payments'),
    path('manager/payments/<uuid:pk>/verify/', ManagerVerifyPaymentView.as_view(), name='manager_verify_payment'),
    path('manager/payments/<uuid:pk>/reject/', ManagerRejectPaymentView.as_view(), name='manager_reject_payment'),
]
