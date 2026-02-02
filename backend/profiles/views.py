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
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, HRFlowable
from PIL import Image as PILImage
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
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
    ProfilePaymentSerializer, ProfilePaymentSubmitSerializer,
    ManagerProfileSerializer, ManagerPaymentSerializer,
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

            # Recalculate profile score to include the submitted payment
            profile.calculate_profile_score()

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

        # Color palette — formal traditional biodata
        navy = colors.HexColor('#1a1a2e')
        gold = colors.HexColor('#c9a84c')
        dark_text = colors.HexColor('#1a1a2e')
        label_gray = colors.HexColor('#555555')
        light_border = colors.HexColor('#d4d4d4')

        # Create PDF
        buffer = BytesIO()
        page_w, page_h = A4
        margin = 0.6 * inch
        doc = SimpleDocTemplate(
            buffer, pagesize=A4,
            topMargin=margin, bottomMargin=0.5 * inch,
            leftMargin=margin, rightMargin=margin,
        )
        content_w = page_w - 2 * margin
        story = []

        # --- Styles ---
        title_style = ParagraphStyle(
            'BiodataTitle', fontSize=26, fontName='Helvetica-Bold',
            textColor=navy, alignment=TA_CENTER, leading=32,
            spaceAfter=2,
        )
        subtitle_style = ParagraphStyle(
            'BiodataSubtitle', fontSize=8, fontName='Helvetica',
            textColor=label_gray, alignment=TA_CENTER, spaceAfter=4,
        )
        name_style = ParagraphStyle(
            'ProfileName', fontSize=18, fontName='Helvetica-Bold',
            textColor=navy, alignment=TA_CENTER, leading=24,
        )
        quick_stats_style = ParagraphStyle(
            'QuickStats', fontSize=10, fontName='Helvetica',
            textColor=label_gray, alignment=TA_CENTER, leading=14,
        )
        section_title_style = ParagraphStyle(
            'SectionTitle', fontSize=12, fontName='Helvetica-Bold',
            textColor=navy, spaceBefore=12, spaceAfter=4,
        )
        cell_label_style = ParagraphStyle(
            'CellLabel', fontSize=9.5, fontName='Helvetica-Bold',
            textColor=label_gray, leading=13,
        )
        cell_value_style = ParagraphStyle(
            'CellValue', fontSize=10, fontName='Helvetica',
            textColor=dark_text, leading=14,
        )
        about_style = ParagraphStyle(
            'AboutText', fontSize=10, fontName='Helvetica',
            textColor=dark_text, leading=16, spaceAfter=4,
        )
        footer_style = ParagraphStyle(
            'Footer', fontSize=8, fontName='Helvetica-Oblique',
            textColor=label_gray, alignment=TA_CENTER,
        )

        # --- Helper functions ---
        def get_choice_display(choices_list, value):
            if not value:
                return None
            try:
                return dict(choices_list)[value]
            except (KeyError, TypeError):
                return str(value) if value else None

        def add_section(title, data):
            """Add a styled section with label-value rows."""
            rows = [(k, v) for k, v in data if v and str(v).strip()]
            if not rows:
                return
            story.append(Paragraph(title, section_title_style))
            story.append(HRFlowable(
                width='100%', thickness=0.75, color=gold,
                spaceAfter=6, spaceBefore=0,
            ))
            table_data = []
            for label, value in rows:
                table_data.append([
                    Paragraph(label, cell_label_style),
                    Paragraph(str(value), cell_value_style),
                ])
            table = Table(table_data, colWidths=[2.2 * inch, content_w - 2.2 * inch])
            style_cmds = [
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('LEFTPADDING', (0, 0), (-1, -1), 10),
                ('RIGHTPADDING', (0, 0), (-1, -1), 10),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('LINEBELOW', (0, 0), (-1, -2), 0.4, light_border),
            ]
            table.setStyle(TableStyle(style_cmds))
            story.append(table)
            story.append(Spacer(1, 0.1 * inch))

        # ===== HEADER — "BIODATA" =====
        story.append(Paragraph("BIODATA", title_style))
        story.append(HRFlowable(
            width='40%', thickness=1, color=gold,
            spaceAfter=4, spaceBefore=0,
        ))
        story.append(Paragraph("KSHATRIYAConnect", subtitle_style))
        story.append(Spacer(1, 0.2 * inch))

        # ===== PHOTO — centered, 2.8 × 3.5 inch box =====
        primary_photo = profile.photos.filter(is_primary=True).first() or profile.photos.first()
        if primary_photo:
            try:
                primary_photo.image.open('rb')
                img_data = primary_photo.image.read()
                primary_photo.image.close()
                img_buffer = BytesIO(img_data)
                pil_img = PILImage.open(img_buffer)
                orig_w, orig_h = pil_img.size
                img_buffer.seek(0)
                # Scale proportionally within 2.8 × 3.5 inch box
                max_w, max_h = 2.8 * inch, 3.5 * inch
                aspect = orig_w / orig_h
                if aspect > max_w / max_h:
                    w = max_w
                    h = w / aspect
                else:
                    h = max_h
                    w = h * aspect
                photo_img = RLImage(img_buffer, width=w, height=h)
                # Wrap in a table for border frame + centering
                photo_table = Table([[photo_img]], colWidths=[w + 8], rowHeights=[h + 8])
                photo_table.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('BOX', (0, 0), (-1, -1), 0.75, navy),
                    ('TOPPADDING', (0, 0), (-1, -1), 4),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                    ('LEFTPADDING', (0, 0), (-1, -1), 4),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 4),
                ]))
                # Center the photo table on the page
                outer = Table([[photo_table]], colWidths=[content_w])
                outer.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 0),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                    ('TOPPADDING', (0, 0), (-1, -1), 0),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
                ]))
                story.append(outer)
                story.append(Spacer(1, 0.2 * inch))
            except Exception:
                pass

        # ===== NAME + QUICK STATS =====
        story.append(Paragraph(profile.full_name or 'N/A', name_style))
        story.append(Spacer(1, 4))

        quick_items = []
        if profile.age:
            quick_items.append(f"{profile.age} yrs")
        gender = get_choice_display(Profile.GENDER_CHOICES, profile.gender)
        if gender:
            quick_items.append(gender)
        if profile.height_display:
            quick_items.append(profile.height_display)
        marital = get_choice_display(Profile.MARITAL_STATUS_CHOICES, profile.marital_status)
        if marital:
            quick_items.append(marital)
        if quick_items:
            story.append(Paragraph(
                ' &nbsp;|&nbsp; '.join(quick_items), quick_stats_style
            ))
        story.append(Spacer(1, 0.2 * inch))

        # ===== DETAIL SECTIONS =====
        add_section("Personal Details", [
            ('Religion', get_choice_display(Profile.RELIGION_CHOICES, profile.religion)),
            ('Caste', profile.caste),
            ('Sub-Caste', profile.sub_caste),
            ('Gotra', profile.gotra),
            ('Manglik', get_choice_display(
                [('yes', 'Yes'), ('no', 'No'), ('partial', 'Partial'), ('dont_know', "Don't Know")],
                profile.manglik,
            )),
            ('Star Sign', profile.star_sign),
            ('Birth Place', profile.birth_place),
            ('Diet', get_choice_display(Profile.DIET_CHOICES, profile.diet)),
            ('Smoking', profile.smoking.replace('_', ' ').title() if profile.smoking else None),
            ('Drinking', profile.drinking.replace('_', ' ').title() if profile.drinking else None),
        ])

        add_section("Education &amp; Career", [
            ('Education', get_choice_display(Profile.EDUCATION_CHOICES, profile.education)),
            ('Education Detail', profile.education_detail),
            ('Profession', profile.profession),
            ('Company', profile.company_name),
            ('Annual Income', get_choice_display(Profile.INCOME_CHOICES, profile.annual_income)),
        ])

        add_section("Family Details", [
            ('Father Name', profile.father_name),
            ('Father Occupation', profile.father_occupation),
            ('Mother Name', profile.mother_name),
            ('Mother Occupation', profile.mother_occupation),
            ('Siblings', profile.siblings),
            ('Family Type', profile.family_type.replace('_', ' ').title() if profile.family_type else None),
            ('Family Values', profile.family_values.replace('_', ' ').title() if profile.family_values else None),
        ])

        add_section("Location", [
            ('Present Address', ', '.join(p for p in [profile.city, profile.district, profile.state] if p)),
            ('Pincode', profile.pincode),
            ('Country', profile.country),
            ('Native State', profile.native_state),
            ('Native District', profile.native_district),
            ('Native Area', profile.native_area),
        ])

        add_section("Contact", [
            ('Email', profile.user.email),
            ('Phone Number', profile.phone_number),
        ])

        # ===== ABOUT ME =====
        if profile.about_me:
            story.append(Paragraph("About Me", section_title_style))
            story.append(HRFlowable(
                width='100%', thickness=0.75, color=gold,
                spaceAfter=6, spaceBefore=0,
            ))
            story.append(Paragraph(profile.about_me, about_style))
            story.append(Spacer(1, 0.1 * inch))

        # ===== FOOTER =====
        story.append(Spacer(1, 0.3 * inch))
        story.append(HRFlowable(width='100%', thickness=0.4, color=light_border, spaceAfter=8))
        story.append(Paragraph(
            f"Confidential — KSHATRIYAConnect &nbsp;&nbsp;|&nbsp;&nbsp; {datetime.now().strftime('%B %d, %Y')}",
            footer_style,
        ))

        # Build PDF
        doc.build(story)
        buffer.seek(0)

        # Create response
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        safe_name = profile.full_name.replace(' ', '_') if profile.full_name else 'profile'
        response['Content-Disposition'] = f'attachment; filename="biodata_{safe_name}_{datetime.now().strftime("%Y%m%d")}.pdf"'
        return response


# ---------------------------------------------------------------------------
# Manager Dashboard Views
# ---------------------------------------------------------------------------

class ManagerDashboardView(views.APIView):
    """Dashboard stats for managers."""
    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request):
        from django.contrib.auth import get_user_model
        User = get_user_model()

        pending_profiles = User.objects.filter(
            is_profile_complete=True,
            is_profile_approved=False,
            is_active=True,
        ).count()
        pending_payments = ProfilePayment.objects.filter(status='pending').count()
        pending_photos = ProfilePhoto.objects.filter(
            is_approved=False, is_rejected=False
        ).count()
        total_users = User.objects.filter(is_active=True, is_manager=False).count()

        return Response({
            'pending_profiles': pending_profiles,
            'pending_payments': pending_payments,
            'pending_photos': pending_photos,
            'total_users': total_users,
        })


class ManagerPendingProfilesView(generics.ListAPIView):
    """List profiles pending approval."""
    permission_classes = [IsAuthenticated, IsManager]
    serializer_class = ManagerProfileSerializer

    def get_queryset(self):
        return Profile.objects.filter(
            user__is_profile_complete=True,
            user__is_profile_approved=False,
            user__is_active=True,
        ).select_related('user').prefetch_related('photos').order_by('-created_at')


class ManagerApproveProfileView(views.APIView):
    """Approve a pending profile."""
    permission_classes = [IsAuthenticated, IsManager]

    def post(self, request, pk):
        try:
            profile = Profile.objects.select_related('user').get(pk=pk)
        except Profile.DoesNotExist:
            return Response({'error': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        user = profile.user
        user.is_profile_approved = True
        user.save(update_fields=['is_profile_approved'])
        return Response({'message': f'Profile for {profile.full_name} approved.'})


class ManagerRejectProfileView(views.APIView):
    """Reject / keep a profile as not approved."""
    permission_classes = [IsAuthenticated, IsManager]

    def post(self, request, pk):
        try:
            profile = Profile.objects.select_related('user').get(pk=pk)
        except Profile.DoesNotExist:
            return Response({'error': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        user = profile.user
        user.is_profile_approved = False
        user.save(update_fields=['is_profile_approved'])
        return Response({'message': f'Profile for {profile.full_name} rejected.'})


class ManagerPendingPaymentsView(generics.ListAPIView):
    """List payments pending verification."""
    permission_classes = [IsAuthenticated, IsManager]
    serializer_class = ManagerPaymentSerializer

    def get_queryset(self):
        return (
            ProfilePayment.objects.filter(status='pending')
            .select_related('profile', 'profile__user')
            .order_by('-submitted_at')
        )


class ManagerVerifyPaymentView(views.APIView):
    """Verify a pending payment."""
    permission_classes = [IsAuthenticated, IsManager]

    def post(self, request, pk):
        try:
            payment = ProfilePayment.objects.select_related('profile').get(pk=pk)
        except ProfilePayment.DoesNotExist:
            return Response({'error': 'Payment not found.'}, status=status.HTTP_404_NOT_FOUND)

        payment.verify(request.user)
        return Response({'message': 'Payment verified successfully.'})


class ManagerRejectPaymentView(views.APIView):
    """Reject a pending payment."""
    permission_classes = [IsAuthenticated, IsManager]

    def post(self, request, pk):
        try:
            payment = ProfilePayment.objects.select_related('profile').get(pk=pk)
        except ProfilePayment.DoesNotExist:
            return Response({'error': 'Payment not found.'}, status=status.HTTP_404_NOT_FOUND)

        reason = request.data.get('reason', '')
        payment.reject(reason)
        return Response({'message': 'Payment rejected.'})
