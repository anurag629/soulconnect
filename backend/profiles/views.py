"""
Views for profiles app.
"""

from django.utils import timezone
from rest_framework import status, generics, views
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from io import BytesIO
from datetime import datetime

from .models import (
    Profile, PartnerPreference, ProfilePhoto,
    GovernmentID, ProfileView, BlockedProfile, ProfilePayment
)
from .serializers import (
    ProfileSerializer, ProfileCreateSerializer, ProfileUpdateSerializer,
    ProfileListSerializer, PartnerPreferenceSerializer, ProfilePhotoSerializer,
    GovernmentIDSerializer, GovernmentIDSubmitSerializer,
    ProfileViewSerializer, BlockedProfileSerializer,
    ProfilePaymentSerializer, ProfilePaymentSubmitSerializer
)
from .filters import ProfileFilter
from .permissions import IsManager


class ProfileCreateView(generics.CreateAPIView):
    """
    Create user profile after registration.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileCreateSerializer
    
    def perform_create(self, serializer):
        # Check if profile already exists
        if hasattr(self.request.user, 'profile'):
            raise serializers.ValidationError("Profile already exists.")
        
        serializer.save(user=self.request.user)


class MyProfileView(generics.RetrieveUpdateAPIView):
    """
    Get or update current user's profile.
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ProfileUpdateSerializer
        return ProfileSerializer

    def get_object(self):
        return self.request.user.profile

    def perform_update(self, serializer):
        profile = serializer.save()
        # Recalculate profile score after update
        profile.calculate_profile_score()


class ProfileDetailView(generics.RetrieveAPIView):
    """
    View another user's profile.
    Records profile view for "Who viewed me" feature.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileSerializer
    queryset = Profile.objects.filter(user__is_active=True, user__is_profile_approved=True)
    lookup_field = 'id'
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Don't record view for own profile
        if hasattr(request.user, 'profile') and instance.id != request.user.profile.id:
            # Record profile view
            ProfileView.objects.create(
                viewer=request.user.profile,
                viewed_profile=instance
            )
            
            # Increment view count
            instance.profile_views += 1
            instance.save(update_fields=['profile_views'])
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class ProfileSearchView(generics.ListAPIView):
    """
    Search and filter profiles - RESTRICTED: Only for managers.
    Regular users cannot access this endpoint.
    """
    permission_classes = [IsAuthenticated, IsManager]
    serializer_class = ProfileListSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ProfileFilter
    
    def get_queryset(self):
        # Manager-only: Can see all profiles
        queryset = Profile.objects.filter(
            user__is_active=True,
            user__is_profile_approved=True,
            user__is_banned=False
        )
        
        # Gender filter for managers
        gender = self.request.query_params.get('gender', None)
        if gender in ['M', 'F']:
            queryset = queryset.filter(gender=gender)
        
        return queryset.select_related('user').prefetch_related('photos')


class PartnerPreferenceView(generics.RetrieveUpdateAPIView):
    """
    Get or update partner preferences.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = PartnerPreferenceSerializer
    
    def get_object(self):
        profile = self.request.user.profile
        preference, created = PartnerPreference.objects.get_or_create(
            profile=profile,
            defaults={
                'age_from': 21 if profile.gender == 'M' else 25,
                'age_to': 30 if profile.gender == 'M' else 35,
            }
        )
        return preference


class PhotoUploadView(views.APIView):
    """
    Upload profile photos.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        profile = request.user.profile
        
        # Check max photos limit
        current_count = profile.photos.count()
        if current_count >= 6:
            return Response(
                {'error': 'Maximum 6 photos allowed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        image = request.FILES.get('image')
        if not image:
            return Response(
                {'error': 'No image provided.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate image size (5MB max)
        if image.size > 5 * 1024 * 1024:
            return Response(
                {'error': 'Image size must be less than 5MB.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check file extension
        ext = image.name.split('.')[-1].lower()
        if ext not in ['jpg', 'jpeg', 'png', 'webp']:
            return Response(
                {'error': 'Only JPG, PNG, and WEBP images are allowed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        is_primary = request.data.get('is_primary', False)
        if current_count == 0:
            is_primary = True
        
        photo = ProfilePhoto.objects.create(
            profile=profile,
            image=image,
            is_primary=is_primary,
            is_approved=True,  # Auto-approve for now
            display_order=current_count
        )
        
        # Recalculate profile score to reflect photo completion
        profile.calculate_profile_score()
        
        return Response(
            ProfilePhotoSerializer(photo, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )


class PhotoDeleteView(views.APIView):
    """
    Delete a profile photo.
    """
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, photo_id):
        try:
            photo = ProfilePhoto.objects.get(
                id=photo_id,
                profile=request.user.profile
            )
            was_primary = photo.is_primary
            profile = request.user.profile
            photo.delete()
            
            # If deleted primary, set another as primary
            if was_primary:
                next_photo = profile.photos.first()
                if next_photo:
                    next_photo.is_primary = True
                    next_photo.save()
            
            # Recalculate profile score after deletion
            profile.calculate_profile_score()
            
            return Response(
                {'message': 'Photo deleted successfully.'},
                status=status.HTTP_200_OK
            )
        except ProfilePhoto.DoesNotExist:
            return Response(
                {'error': 'Photo not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class SetPrimaryPhotoView(views.APIView):
    """
    Set a photo as primary.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, photo_id):
        try:
            photo = ProfilePhoto.objects.get(
                id=photo_id,
                profile=request.user.profile
            )
            photo.is_primary = True
            photo.save()
            
            return Response(
                {'message': 'Primary photo updated.'},
                status=status.HTTP_200_OK
            )
        except ProfilePhoto.DoesNotExist:
            return Response(
                {'error': 'Photo not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class GovernmentIDSubmitView(generics.CreateAPIView):
    """
    Submit government ID for verification.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = GovernmentIDSubmitSerializer
    parser_classes = [MultiPartParser, FormParser]
    
    def perform_create(self, serializer):
        serializer.save(profile=self.request.user.profile)


class GovernmentIDListView(generics.ListAPIView):
    """
    List submitted government IDs.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = GovernmentIDSerializer
    
    def get_queryset(self):
        return GovernmentID.objects.filter(profile=self.request.user.profile)


class ProfileViewsListView(generics.ListAPIView):
    """
    List who viewed my profile (premium feature).
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileViewSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        # Only premium users can see who viewed them
        if not user.is_premium:
            return ProfileView.objects.none()
        
        return ProfileView.objects.filter(
            viewed_profile=user.profile
        ).select_related('viewer', 'viewer__user').order_by('-viewed_at')


class BlockProfileView(views.APIView):
    """
    Block a profile.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, profile_id):
        try:
            profile_to_block = Profile.objects.get(id=profile_id)
            
            if profile_to_block.user == request.user:
                return Response(
                    {'error': 'You cannot block yourself.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            BlockedProfile.objects.get_or_create(
                blocker=request.user.profile,
                blocked=profile_to_block,
                defaults={'reason': request.data.get('reason', '')}
            )
            
            return Response(
                {'message': 'Profile blocked successfully.'},
                status=status.HTTP_200_OK
            )
        except Profile.DoesNotExist:
            return Response(
                {'error': 'Profile not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class UnblockProfileView(views.APIView):
    """
    Unblock a profile.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, profile_id):
        try:
            BlockedProfile.objects.filter(
                blocker=request.user.profile,
                blocked_id=profile_id
            ).delete()
            
            return Response(
                {'message': 'Profile unblocked successfully.'},
                status=status.HTTP_200_OK
            )
        except Exception:
            return Response(
                {'error': 'Error unblocking profile.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class BlockedProfilesListView(generics.ListAPIView):
    """
    List blocked profiles.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = BlockedProfileSerializer
    
    def get_queryset(self):
        return BlockedProfile.objects.filter(
            blocker=self.request.user.profile
        ).select_related('blocked', 'blocked__user')


class ProfilePaymentSubmitView(views.APIView):
    """
    Submit profile payment with transaction ID.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        profile = request.user.profile
        
        # Check if already has verified payment
        existing_verified = ProfilePayment.objects.filter(
            profile=profile,
            status='verified'
        ).exists()
        
        if existing_verified:
            return Response(
                {'error': 'Payment already verified for this profile.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ProfilePaymentSubmitSerializer(data=request.data)
        if serializer.is_valid():
            payment = serializer.save(profile=profile)
            
            return Response({
                'message': 'Payment submitted successfully. Verification pending.',
                'payment': ProfilePaymentSerializer(payment).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfilePaymentStatusView(views.APIView):
    """
    Get current payment status.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        profile = request.user.profile
        
        # Get the latest payment
        payment = ProfilePayment.objects.filter(profile=profile).order_by('-submitted_at').first()
        
        if payment:
            return Response({
                'has_payment': True,
                'payment': ProfilePaymentSerializer(payment).data,
                'is_profile_complete': request.user.is_profile_complete,
                'is_profile_approved': request.user.is_profile_approved,
            })
        
        return Response({
            'has_payment': False,
            'payment': None,
            'is_profile_complete': request.user.is_profile_complete,
            'is_profile_approved': request.user.is_profile_approved,
        })


class ProfilePaymentListView(generics.ListAPIView):
    """
    List all payments for current user.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ProfilePaymentSerializer
    
    def get_queryset(self):
        return ProfilePayment.objects.filter(
            profile=self.request.user.profile
        ).order_by('-submitted_at')


class ManagerProfileDownloadView(views.APIView):
    """
    Download profile as PDF - Manager only.
    """
    permission_classes = [IsAuthenticated, IsManager]
    
    def get(self, request, profile_id):
        try:
            profile = Profile.objects.select_related('user').prefetch_related('photos').get(id=profile_id)
        except Profile.DoesNotExist:
            return Response(
                {'error': 'Profile not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Create PDF
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
        story = []
        
        # Styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=20,
            textColor=colors.HexColor('#1f2937'),
            spaceAfter=12,
            alignment=1,  # Center
        )
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#4b5563'),
            spaceAfter=8,
            spaceBefore=12,
        )
        normal_style = styles['Normal']
        
        # Title
        story.append(Paragraph("SoulConnect Profile Report", title_style))
        story.append(Spacer(1, 0.2*inch))
        story.append(Paragraph(f"Generated on: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", 
                               styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        
        # Profile Information
        def add_section(title, data):
            story.append(Paragraph(title, heading_style))
            table_data = []
            for key, value in data.items():
                if value:
                    display_key = key.replace('_', ' ').title()
                    table_data.append([display_key, str(value)])
            
            if table_data:
                table = Table(table_data, colWidths=[2.5*inch, 4.5*inch])
                table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
                    ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                    ('TOPPADDING', (0, 0), (-1, -1), 8),
                    ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                ]))
                story.append(table)
                story.append(Spacer(1, 0.2*inch))
        
        # Helper function to get choice display
        def get_choice_display(choices_list, value):
            if not value:
                return 'Not specified'
            try:
                return dict(choices_list)[value]
            except (KeyError, TypeError):
                return str(value) if value else 'Not specified'
        
        # Basic Information
        basic_info = {
            'Full Name': profile.full_name,
            'Email': profile.user.email,
            'Gender': get_choice_display(Profile.GENDER_CHOICES, profile.gender),
            'Date of Birth': profile.date_of_birth.strftime('%B %d, %Y') if profile.date_of_birth else None,
            'Age': str(profile.age),
            'Height': f"{profile.height_display} ({profile.height_cm} cm)",
            'Marital Status': get_choice_display(Profile.MARITAL_STATUS_CHOICES, profile.marital_status),
        }
        add_section("Basic Information", basic_info)
        
        # Religious & Background
        religious_info = {
            'Religion': get_choice_display(Profile.RELIGION_CHOICES, profile.religion),
            'Caste': profile.caste or 'Not specified',
            'Sub-Caste': profile.sub_caste or 'Not specified',
            'Gotra': profile.gotra or 'Not specified',
            'Manglik': get_choice_display([
                ('yes', 'Yes'), ('no', 'No'), ('partial', 'Partial'), ('dont_know', "Don't Know")
            ], profile.manglik) if profile.manglik else 'Not specified',
            'Star Sign': profile.star_sign or 'Not specified',
            'Birth Place': profile.birth_place or 'Not specified',
        }
        add_section("Religious & Background", religious_info)
        
        # Education & Career
        career_info = {
            'Education': get_choice_display(Profile.EDUCATION_CHOICES, profile.education),
            'Education Detail': profile.education_detail or 'Not specified',
            'Profession': profile.profession,
            'Company': profile.company_name or 'Not specified',
            'Annual Income': get_choice_display(Profile.INCOME_CHOICES, profile.annual_income),
        }
        add_section("Education & Career", career_info)
        
        # Location
        location_info = {
            'Present Address': f"{profile.city}, {profile.district}, {profile.state}",
            'Pincode': profile.pincode or 'Not specified',
            'Country': profile.country,
            'Native State': profile.native_state or 'Not specified',
            'Native District': profile.native_district or 'Not specified',
            'Native Area': profile.native_area or 'Not specified',
        }
        add_section("Location", location_info)
        
        # Family Details
        family_info = {
            'Father Name': profile.father_name or 'Not specified',
            'Father Occupation': profile.father_occupation or 'Not specified',
            'Mother Name': profile.mother_name or 'Not specified',
            'Mother Occupation': profile.mother_occupation or 'Not specified',
            'Siblings': profile.siblings or 'Not specified',
            'Family Type': profile.family_type.replace('_', ' ').title() if profile.family_type else 'Not specified',
            'Family Values': profile.family_values.replace('_', ' ').title() if profile.family_values else 'Not specified',
        }
        add_section("Family Details", family_info)
        
        # Lifestyle
        lifestyle_info = {
            'Diet': get_choice_display(Profile.DIET_CHOICES, profile.diet),
            'Smoking': profile.smoking.replace('_', ' ').title() if profile.smoking else 'Not specified',
            'Drinking': profile.drinking.replace('_', ' ').title() if profile.drinking else 'Not specified',
        }
        add_section("Lifestyle", lifestyle_info)
        
        # About Me
        if profile.about_me:
            story.append(Paragraph("About Me", heading_style))
            story.append(Paragraph(profile.about_me, normal_style))
            story.append(Spacer(1, 0.2*inch))
        
        # Contact (if available)
        contact_info = {
            'Phone Number': profile.phone_number or 'Not provided',
        }
        add_section("Contact Information", contact_info)
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        
        # Create response
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="profile_{profile.full_name.replace(" ", "_")}_{datetime.now().strftime("%Y%m%d")}.pdf"'
        return response
