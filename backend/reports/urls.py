"""
URL configuration for reports app.
"""

from django.urls import path
from .views import (
    SubmitReportView, MyReportsView,
    SubmitFeedbackView, MyFeedbackView
)

app_name = 'reports'

urlpatterns = [
    # Reports
    path('submit/', SubmitReportView.as_view(), name='submit_report'),
    path('my-reports/', MyReportsView.as_view(), name='my_reports'),
    
    # Feedback
    path('feedback/', SubmitFeedbackView.as_view(), name='submit_feedback'),
    path('my-feedback/', MyFeedbackView.as_view(), name='my_feedback'),
]
