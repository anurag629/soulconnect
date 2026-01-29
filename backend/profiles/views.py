"""
Views for profiles app.
"""

from django.db.models import Q
from django.utils import timezone
from rest_framework import status, generics, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    Profile, PartnerPreference, ProfilePhoto,
    GovernmentID, ProfileView, BlockedProfile
)
from .serializers import (
    ProfileSerializer, ProfileCreateSerializer, ProfileUpdateSerializer,
    ProfileListSerializer, PartnerPreferenceSerializer, ProfilePhotoSerializer,
    GovernmentIDSerializer, GovernmentIDSubmitSerializer,
    ProfileViewSerializer, BlockedProfileSerializer
)
from .filters import ProfileFilter


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
    Search and filter profiles.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileListSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ProfileFilter
    
    def get_queryset(self):
        user = self.request.user
        
        # Base queryset - only approved, active profiles
        queryset = Profile.objects.filter(
            user__is_active=True,
            user__is_profile_approved=True,
            user__is_banned=False
        ).exclude(user=user)
        
        # Exclude blocked profiles
        if hasattr(user, 'profile'):
            blocked_ids = BlockedProfile.objects.filter(
                blocker=user.profile
            ).values_list('blocked_id', flat=True)
            
            blockers_ids = BlockedProfile.objects.filter(
                blocked=user.profile
            ).values_list('blocker_id', flat=True)
            
            queryset = queryset.exclude(id__in=list(blocked_ids) + list(blockers_ids))
            
            # Filter by opposite gender
            if user.profile.gender == 'M':
                queryset = queryset.filter(gender='F')
            else:
                queryset = queryset.filter(gender='M')
        
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
        
        return Response(
            ProfilePhotoSerializer(photo).data,
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
            photo.delete()
            
            # If deleted primary, set another as primary
            if was_primary:
                next_photo = request.user.profile.photos.first()
                if next_photo:
                    next_photo.is_primary = True
                    next_photo.save()
            
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
