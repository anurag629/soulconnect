"""
Serializers for profiles app.
"""

from rest_framework import serializers
from django.conf import settings
from .models import (
    Profile, PartnerPreference, ProfilePhoto, 
    GovernmentID, ProfileView, BlockedProfile, ProfilePayment
)


class ProfilePhotoSerializer(serializers.ModelSerializer):
    """Serializer for profile photos."""
    
    image_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ProfilePhoto
        fields = [
            'id', 'image_url', 'thumbnail_url', 'is_primary',
            'is_approved', 'display_order', 'uploaded_at'
        ]
        read_only_fields = ['id', 'is_approved', 'uploaded_at']
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return f"http://127.0.0.1:8000{obj.image.url}"
        return None
    
    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.thumbnail.url)
            return f"http://127.0.0.1:8000{obj.thumbnail.url}"
        return self.get_image_url(obj)


class PartnerPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for partner preferences."""
    
    class Meta:
        model = PartnerPreference
        fields = [
            'age_from', 'age_to', 'height_from', 'height_to',
            'marital_status', 'religion', 'caste', 'caste_no_bar',
            'education', 'profession', 'income_from', 'income_to',
            'country', 'state', 'city', 'mother_tongue',
            'diet', 'smoking', 'drinking', 'manglik',
            'additional_preferences'
        ]


class UserBasicSerializer(serializers.Serializer):
    """Basic user info for profile listings."""
    id = serializers.UUIDField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()


class ProfileSerializer(serializers.ModelSerializer):
    """
    Complete serializer for profile with all details.
    """

    user = UserBasicSerializer(read_only=True)
    photos = ProfilePhotoSerializer(many=True, read_only=True)
    age = serializers.ReadOnlyField()
    height_display = serializers.ReadOnlyField()
    is_verified = serializers.SerializerMethodField()
    is_premium = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            'id', 'user', 'full_name', 'gender', 'date_of_birth', 'age',
            'height_cm', 'height_display',
            'marital_status', 'religion', 'caste', 'sub_caste', 'gotra',
            'education', 'education_detail', 'profession', 'company_name', 'annual_income',
            'state', 'district', 'city', 'country', 'pincode',
            'native_state', 'native_district', 'native_area',
            'father_name', 'father_occupation', 'mother_name', 'mother_occupation',
            'siblings', 'family_type', 'family_values',
            'diet', 'smoking', 'drinking',
            'manglik', 'star_sign', 'birth_time', 'birth_place',
            'about_me', 'phone_number', 'whatsapp_number',
            'profile_views', 'profile_score',
            'photos',
            'is_verified', 'is_premium',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'profile_views', 'profile_score', 'created_at', 'updated_at']
    
    def get_is_verified(self, obj):
        return obj.user.is_id_verified
    
    def get_is_premium(self, obj):
        return obj.user.is_premium


class ProfileCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new profile.
    """

    class Meta:
        model = Profile
        fields = [
            'full_name', 'gender', 'date_of_birth',
            'height_cm',
            'marital_status', 'religion', 'caste', 'sub_caste', 'gotra',
            'education', 'education_detail', 'profession', 'company_name', 'annual_income',
            'state', 'district', 'city', 'country', 'pincode',
            'native_state', 'native_district', 'native_area',
            'father_name', 'father_occupation', 'mother_name', 'mother_occupation',
            'siblings', 'family_type', 'family_values',
            'diet', 'smoking', 'drinking',
            'manglik', 'star_sign', 'birth_time', 'birth_place',
            'about_me', 'phone_number', 'whatsapp_number',
        ]

    def validate_date_of_birth(self, value):
        """Validate age is at least 18."""
        from datetime import date
        today = date.today()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age < 18:
            raise serializers.ValidationError("You must be at least 18 years old to register.")
        return value

    def create(self, validated_data):
        profile = Profile.objects.create(**validated_data)

        # Mark user profile as complete
        profile.user.is_profile_complete = True
        profile.user.save(update_fields=['is_profile_complete'])

        # Calculate initial profile score
        profile.calculate_profile_score()

        return profile


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating profile.
    """

    class Meta:
        model = Profile
        fields = [
            'full_name', 'gender', 'date_of_birth', 'height_cm',
            'marital_status', 'religion', 'caste', 'sub_caste', 'gotra',
            'education', 'education_detail', 'profession', 'company_name', 'annual_income',
            'state', 'district', 'city', 'country', 'pincode',
            'native_state', 'native_district', 'native_area',
            'father_name', 'father_occupation', 'mother_name', 'mother_occupation',
            'siblings', 'family_type', 'family_values',
            'diet', 'smoking', 'drinking',
            'manglik', 'star_sign', 'birth_time', 'birth_place',
            'about_me', 'phone_number', 'whatsapp_number'
        ]


class ProfileListSerializer(serializers.ModelSerializer):
    """
    Minimal serializer for profile listings.
    """
    
    user = UserBasicSerializer(read_only=True)
    age = serializers.ReadOnlyField()
    height_display = serializers.ReadOnlyField()
    photos = ProfilePhotoSerializer(many=True, read_only=True)
    primary_photo = serializers.SerializerMethodField()
    is_verified = serializers.SerializerMethodField()
    is_premium = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = [
            'id', 'user', 'full_name', 'age', 'height_display', 'date_of_birth',
            'religion', 'caste',
            'education', 'profession', 'annual_income', 'city', 'state',
            'about_me', 'photos', 'primary_photo', 'is_verified', 'is_premium'
        ]
    
    def get_primary_photo(self, obj):
        primary = obj.photos.filter(is_primary=True, is_approved=True).first()
        if not primary:
            primary = obj.photos.filter(is_approved=True).first()
        if primary:
            return ProfilePhotoSerializer(primary, context=self.context).data
        return None
    
    def get_is_verified(self, obj):
        return obj.user.is_id_verified
    
    def get_is_premium(self, obj):
        return obj.user.is_premium


class ProfileViewSerializer(serializers.ModelSerializer):
    """Serializer for profile views."""
    
    viewer = ProfileListSerializer(read_only=True)
    
    class Meta:
        model = ProfileView
        fields = ['id', 'viewer', 'viewed_at']


class GovernmentIDSerializer(serializers.ModelSerializer):
    """Serializer for government ID verification."""
    
    class Meta:
        model = GovernmentID
        fields = [
            'id', 'id_type', 'id_number', 'document_front', 'document_back',
            'status', 'rejection_reason', 'submitted_at', 'verified_at'
        ]
        read_only_fields = ['id', 'status', 'rejection_reason', 'submitted_at', 'verified_at']


class GovernmentIDSubmitSerializer(serializers.ModelSerializer):
    """Serializer for submitting government ID."""
    
    class Meta:
        model = GovernmentID
        fields = ['id_type', 'id_number', 'document_front', 'document_back']


class BlockedProfileSerializer(serializers.ModelSerializer):
    """Serializer for blocked profiles."""
    
    blocked = ProfileListSerializer(read_only=True)
    
    class Meta:
        model = BlockedProfile
        fields = ['id', 'blocked', 'blocked_at', 'reason']
        read_only_fields = ['id', 'blocked_at']


class ProfilePaymentSerializer(serializers.ModelSerializer):
    """Serializer for profile payments."""
    
    class Meta:
        model = ProfilePayment
        fields = [
            'id', 'amount', 'transaction_id', 'payment_screenshot',
            'status', 'rejection_reason', 'submitted_at', 'verified_at'
        ]
        read_only_fields = ['id', 'amount', 'status', 'rejection_reason', 'submitted_at', 'verified_at']


class ProfilePaymentSubmitSerializer(serializers.ModelSerializer):
    """Serializer for submitting profile payment."""
    
    class Meta:
        model = ProfilePayment
        fields = ['transaction_id', 'payment_screenshot']
    
    def validate_transaction_id(self, value):
        """Validate transaction ID is unique."""
        if ProfilePayment.objects.filter(transaction_id=value).exists():
            raise serializers.ValidationError("This transaction ID has already been submitted.")
        return value
