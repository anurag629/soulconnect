"""
Views for reports app.
"""

from rest_framework import status, generics, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from profiles.models import Profile
from .models import Report, Feedback
from .serializers import (
    ReportSerializer, ReportCreateSerializer,
    FeedbackSerializer, FeedbackCreateSerializer
)


class SubmitReportView(views.APIView):
    """
    Submit a report against a profile.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        serializer = ReportCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            profile_id = serializer.validated_data['profile_id']
            
            try:
                reported_profile = Profile.objects.get(id=profile_id)
                
                # Prevent self-reporting
                if reported_profile.user == request.user:
                    return Response(
                        {'error': 'You cannot report yourself.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Check for duplicate recent report
                existing = Report.objects.filter(
                    reporter=request.user.profile,
                    reported_profile=reported_profile,
                    status='pending'
                ).exists()
                
                if existing:
                    return Response(
                        {'error': 'You have already submitted a report for this profile.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                report = Report.objects.create(
                    reporter=request.user.profile,
                    reported_profile=reported_profile,
                    report_type=serializer.validated_data['report_type'],
                    description=serializer.validated_data['description'],
                    screenshot=serializer.validated_data.get('screenshot')
                )
                
                return Response({
                    'message': 'Report submitted successfully. Our team will review it shortly.',
                    'report': ReportSerializer(report).data
                }, status=status.HTTP_201_CREATED)
                
            except Profile.DoesNotExist:
                return Response(
                    {'error': 'Profile not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyReportsView(generics.ListAPIView):
    """
    List reports submitted by the current user.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ReportSerializer
    
    def get_queryset(self):
        return Report.objects.filter(reporter=self.request.user.profile)


class SubmitFeedbackView(views.APIView):
    """
    Submit feedback.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        serializer = FeedbackCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            feedback = Feedback.objects.create(
                user=request.user,
                feedback_type=serializer.validated_data['feedback_type'],
                subject=serializer.validated_data['subject'],
                message=serializer.validated_data['message'],
                screenshot=serializer.validated_data.get('screenshot')
            )
            
            return Response({
                'message': 'Thank you for your feedback!',
                'feedback': FeedbackSerializer(feedback).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyFeedbackView(generics.ListAPIView):
    """
    List feedback submitted by the current user.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = FeedbackSerializer
    
    def get_queryset(self):
        return Feedback.objects.filter(user=self.request.user)
