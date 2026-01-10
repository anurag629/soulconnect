"""
Serializers for accounts app.

Handles serialization/deserialization of User model and authentication data.
"""

from datetime import date
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.validators import EmailValidator
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    
    Validates email uniqueness and password strength.
    Accepts additional profile fields for initial profile creation.
    """
    email = serializers.EmailField(
        required=True,
        validators=[EmailValidator()]
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    # Optional fields from frontend (stored in session for profile creation)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    gender = serializers.CharField(required=False, allow_blank=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'phone_number', 'gender', 'date_of_birth']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate_email(self, value):
        """Ensure email is unique (case-insensitive)."""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()
    
    def validate_date_of_birth(self, value):
        """Validate age is between 18 and 70."""
        if value:
            today = date.today()
            age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
            if age < 18:
                raise serializers.ValidationError("You must be at least 18 years old.")
            if age > 70:
                raise serializers.ValidationError("Age must be 70 or less.")
        return value
    
    def create(self, validated_data):
        """Create new user with hashed password."""
        # Remove profile-related fields (will be used when creating profile)
        phone_number = validated_data.pop('phone_number', '')
        gender = validated_data.pop('gender', '')
        date_of_birth = validated_data.pop('date_of_birth', None)
        
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        
        # Store registration data in context for profile creation later
        # The profile will be created when user completes profile setup
        self.context['registration_data'] = {
            'phone_number': phone_number,
            'gender': gender,
            'date_of_birth': date_of_birth,
        }
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    
    Validates credentials and returns JWT tokens.
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Validate user credentials."""
        email = attrs.get('email', '').lower()
        password = attrs.get('password', '')
        
        if not email or not password:
            raise serializers.ValidationError("Both email and password are required.")
        
        user = authenticate(
            request=self.context.get('request'),
            username=email,
            password=password
        )
        
        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        
        if not user.is_active:
            raise serializers.ValidationError("This account has been deactivated.")
        
        if user.is_banned:
            raise serializers.ValidationError("This account has been banned.")
        
        attrs['user'] = user
        return attrs
    
    def get_tokens(self, user):
        """Generate JWT tokens for user."""
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model.
    
    Used for retrieving user information.
    """
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'is_email_verified', 'is_profile_complete', 'is_profile_approved',
            'is_id_verified', 'is_premium', 'last_active', 'created_at'
        ]
        read_only_fields = [
            'id', 'email', 'is_email_verified', 'is_profile_complete',
            'is_profile_approved', 'is_id_verified', 'is_premium',
            'last_active', 'created_at'
        ]
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()


class EmailVerificationSerializer(serializers.Serializer):
    """Serializer for email verification."""
    token = serializers.CharField(required=True)


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request."""
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """Check if user with email exists."""
        try:
            self.user = User.objects.get(email__iexact=value)
        except User.DoesNotExist:
            # Don't reveal if email exists
            pass
        return value.lower()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation."""
    token = serializers.CharField(required=True)
    password = serializers.CharField(
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        required=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Validate that passwords match."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password_confirm": "Passwords do not match."
            })
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password."""
    current_password = serializers.CharField(
        required=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        style={'input_type': 'password'}
    )
    
    def validate_current_password(self, value):
        """Validate current password."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value
    
    def validate(self, attrs):
        """Validate that new passwords match."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password_confirm": "New passwords do not match."
            })
        return attrs
