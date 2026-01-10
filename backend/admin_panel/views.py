"""
Admin panel views.
"""

from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta
from rest_framework import status, generics, views
from rest_framework.response import Response

from accounts.models import User
from accounts.tasks import send_welcome_email
from profiles.models import Profile, ProfilePhoto, GovernmentID
from matching.models import Match
from payments.models import Payment, Subscription
from reports.models import Report, Feedback

from .permissions import IsAdminUser, IsSuperUser
from .serializers import (
    AdminUserSerializer, AdminProfileSerializer,
    AdminPhotoSerializer, AdminGovernmentIDSerializer,
    AdminReportSerializer, DashboardStatsSerializer
)


class AdminDashboardView(views.APIView):
    """
    Admin dashboard with statistics.
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        now = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        stats = {
            'total_users': User.objects.count(),
            'active_users': User.objects.filter(
                is_active=True,
                last_active__gte=now - timedelta(days=30)
            ).count(),
            'pending_approvals': User.objects.filter(
                is_profile_complete=True,
                is_profile_approved=False
            ).count(),
            'pending_verifications': GovernmentID.objects.filter(
                status='pending'
            ).count(),
            'pending_reports': Report.objects.filter(
                status='pending'
            ).count(),
            'total_premium': User.objects.filter(is_premium=True).count(),
            'total_matches': Match.objects.filter(status='active').count(),
            'revenue_this_month': Payment.objects.filter(
                status='completed',
                completed_at__gte=month_start
            ).aggregate(total=Sum('amount'))['total'] or 0,
        }
        
        return Response(DashboardStatsSerializer(stats).data)


class PendingApprovalsView(generics.ListAPIView):
    """
    List profiles pending approval.
    """
    permission_classes = [IsAdminUser]
    serializer_class = AdminProfileSerializer
    
    def get_queryset(self):
        return Profile.objects.filter(
            user__is_profile_complete=True,
            user__is_profile_approved=False,
            user__is_banned=False
        ).select_related('user')


class ApproveProfileView(views.APIView):
    """
    Approve a profile.
    """
    permission_classes = [IsAdminUser]
    
    def post(self, request, profile_id):
        try:
            profile = Profile.objects.get(id=profile_id)
            
            profile.user.is_profile_approved = True
            profile.user.save(update_fields=['is_profile_approved'])
            
            # Send welcome email
            send_welcome_email.delay(str(profile.user.id))
            
            return Response({
                'message': 'Profile approved successfully.'
            })
        except Profile.DoesNotExist:
            return Response(
                {'error': 'Profile not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class RejectProfileView(views.APIView):
    """
    Reject a profile with reason.
    """
    permission_classes = [IsAdminUser]
    
    def post(self, request, profile_id):
        reason = request.data.get('reason', '')
        
        try:
            profile = Profile.objects.get(id=profile_id)
            
            # Keep is_profile_approved as False
            # You might want to send an email with the reason
            
            return Response({
                'message': 'Profile rejected.',
                'reason': reason
            })
        except Profile.DoesNotExist:
            return Response(
                {'error': 'Profile not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class PendingPhotosView(generics.ListAPIView):
    """
    List photos pending approval.
    """
    permission_classes = [IsAdminUser]
    serializer_class = AdminPhotoSerializer
    
    def get_queryset(self):
        return ProfilePhoto.objects.filter(
            is_approved=False,
            is_rejected=False
        ).select_related('profile')


class ApprovePhotoView(views.APIView):
    """
    Approve a photo.
    """
    permission_classes = [IsAdminUser]
    
    def post(self, request, photo_id):
        try:
            photo = ProfilePhoto.objects.get(id=photo_id)
            
            photo.is_approved = True
            photo.approved_at = timezone.now()
            photo.save(update_fields=['is_approved', 'approved_at'])
            
            return Response({'message': 'Photo approved.'})
        except ProfilePhoto.DoesNotExist:
            return Response(
                {'error': 'Photo not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class RejectPhotoView(views.APIView):
    """
    Reject a photo with reason.
    """
    permission_classes = [IsAdminUser]
    
    def post(self, request, photo_id):
        reason = request.data.get('reason', 'Photo does not meet guidelines.')
        
        try:
            photo = ProfilePhoto.objects.get(id=photo_id)
            
            photo.is_rejected = True
            photo.rejection_reason = reason
            photo.save(update_fields=['is_rejected', 'rejection_reason'])
            
            return Response({'message': 'Photo rejected.'})
        except ProfilePhoto.DoesNotExist:
            return Response(
                {'error': 'Photo not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class PendingVerificationsView(generics.ListAPIView):
    """
    List pending ID verifications.
    """
    permission_classes = [IsAdminUser]
    serializer_class = AdminGovernmentIDSerializer
    
    def get_queryset(self):
        return GovernmentID.objects.filter(
            status='pending'
        ).select_related('profile', 'profile__user')


class VerifyIDView(views.APIView):
    """
    Verify a government ID.
    """
    permission_classes = [IsAdminUser]
    
    def post(self, request, id):
        try:
            gov_id = GovernmentID.objects.get(id=id)
            
            gov_id.status = 'verified'
            gov_id.verified_by = request.user
            gov_id.verified_at = timezone.now()
            gov_id.save()
            
            # Mark user as ID verified
            gov_id.profile.user.is_id_verified = True
            gov_id.profile.user.save(update_fields=['is_id_verified'])
            
            return Response({'message': 'ID verified successfully.'})
        except GovernmentID.DoesNotExist:
            return Response(
                {'error': 'ID not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class RejectIDView(views.APIView):
    """
    Reject a government ID.
    """
    permission_classes = [IsAdminUser]
    
    def post(self, request, id):
        reason = request.data.get('reason', 'ID verification failed.')
        
        try:
            gov_id = GovernmentID.objects.get(id=id)
            
            gov_id.status = 'rejected'
            gov_id.rejection_reason = reason
            gov_id.save(update_fields=['status', 'rejection_reason'])
            
            return Response({'message': 'ID rejected.'})
        except GovernmentID.DoesNotExist:
            return Response(
                {'error': 'ID not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class ReportsListView(generics.ListAPIView):
    """
    List all reports.
    """
    permission_classes = [IsAdminUser]
    serializer_class = AdminReportSerializer
    
    def get_queryset(self):
        status_filter = self.request.query_params.get('status', 'pending')
        return Report.objects.filter(
            status=status_filter
        ).select_related('reporter', 'reported_profile')


class ResolveReportView(views.APIView):
    """
    Resolve a report.
    """
    permission_classes = [IsAdminUser]
    
    def post(self, request, report_id):
        action = request.data.get('action', 'none')
        notes = request.data.get('notes', '')
        
        try:
            report = Report.objects.get(id=report_id)
            
            report.status = 'resolved'
            report.action_taken = action
            report.resolution_notes = notes
            report.resolved_by = request.user
            report.resolved_at = timezone.now()
            report.save()
            
            # Apply action
            if action == 'account_banned':
                user = report.reported_profile.user
                user.is_banned = True
                user.ban_reason = f"Banned due to report: {report.report_type}"
                user.save()
            elif action == 'profile_suspended':
                user = report.reported_profile.user
                user.is_profile_approved = False
                user.save()
            
            return Response({'message': 'Report resolved.'})
        except Report.DoesNotExist:
            return Response(
                {'error': 'Report not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class UserManagementView(generics.ListAPIView):
    """
    List and search users.
    """
    permission_classes = [IsAdminUser]
    serializer_class = AdminUserSerializer
    
    def get_queryset(self):
        queryset = User.objects.all()
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter == 'active':
            queryset = queryset.filter(is_active=True, is_banned=False)
        elif status_filter == 'banned':
            queryset = queryset.filter(is_banned=True)
        elif status_filter == 'premium':
            queryset = queryset.filter(is_premium=True)
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        return queryset.order_by('-created_at')


class BanUserView(views.APIView):
    """
    Ban a user.
    """
    permission_classes = [IsAdminUser]
    
    def post(self, request, user_id):
        reason = request.data.get('reason', '')
        
        try:
            user = User.objects.get(id=user_id)
            
            if user.is_superuser:
                return Response(
                    {'error': 'Cannot ban superuser.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user.is_banned = True
            user.ban_reason = reason
            user.is_active = False
            user.save()
            
            return Response({'message': 'User banned successfully.'})
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class UnbanUserView(views.APIView):
    """
    Unban a user.
    """
    permission_classes = [IsAdminUser]
    
    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            
            user.is_banned = False
            user.ban_reason = ''
            user.is_active = True
            user.save()
            
            return Response({'message': 'User unbanned successfully.'})
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class SubscriptionStatsView(views.APIView):
    """
    Get subscription statistics.
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        now = timezone.now()
        
        stats = {
            'active_subscriptions': Subscription.objects.filter(
                status='active',
                end_date__gt=now
            ).count(),
            'expiring_soon': Subscription.objects.filter(
                status='active',
                end_date__gt=now,
                end_date__lte=now + timedelta(days=7)
            ).count(),
            'total_revenue': Payment.objects.filter(
                status='completed'
            ).aggregate(total=Sum('amount'))['total'] or 0,
            'subscriptions_by_plan': Subscription.objects.filter(
                status='active'
            ).values('plan__name').annotate(count=Count('id')),
        }
        
        return Response(stats)
