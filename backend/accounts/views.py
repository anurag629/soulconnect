"""
Views for accounts app.

Handles user registration, authentication, email verification,
and password management.
"""

import secrets
import logging
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from .models import User, EmailVerificationToken, PasswordResetToken
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserSerializer,
    EmailVerificationSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    ChangePasswordSerializer,
)
from .tasks import send_verification_email, send_password_reset_email

logger = logging.getLogger(__name__)


class RegisterView(APIView):
    """
    API endpoint for user registration.
    
    Creates a new user account and sends verification email.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        logger.info(f"Registration attempt with email: {request.data.get('email')}")
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                user = serializer.save()
                logger.info(f"User created successfully: {user.email}")
                
                # Generate verification token
                token = secrets.token_urlsafe(32)
                EmailVerificationToken.objects.create(
                    user=user,
                    token=token,
                    expires_at=timezone.now() + timedelta(hours=24)
                )
                logger.info(f"Verification token created for user: {user.email}")
                
                # Send verification email (async via Celery)
                # Don't fail registration if email sending fails
                try:
                    send_verification_email.delay(user.id, token)
                    logger.info(f"Verification email queued for: {user.email}")
                except Exception as e:
                    # Log the error but don't fail registration
                    logger.error(f"Failed to queue verification email for {user.email}: {str(e)}")
                
                return Response({
                    'message': 'Registration successful. Please check your email to verify your account.',
                    'user': UserSerializer(user).data
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.error(f"Registration failed for {request.data.get('email')}: {str(e)}")
                return Response({
                    'detail': 'Registration failed due to server error. Please try again.',
                    'error': str(e) if settings.DEBUG else None
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        logger.warning(f"Registration validation failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    API endpoint for user login.
    
    Authenticates user and returns JWT tokens.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            tokens = serializer.get_tokens(user)
            user.update_last_active()
            
            return Response({
                'message': 'Login successful.',
                'user': UserSerializer(user).data,
                'tokens': tokens
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    """
    API endpoint for user logout.
    
    Blacklists the refresh token to invalidate the session.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response({
                'message': 'Logout successful.'
            }, status=status.HTTP_200_OK)
        except Exception:
            return Response({
                'message': 'Logout successful.'
            }, status=status.HTTP_200_OK)


class VerifyEmailView(APIView):
    """
    API endpoint to verify user email.
    
    Validates the token and marks email as verified.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)
        
        if serializer.is_valid():
            token = serializer.validated_data['token']
            
            try:
                email_token = EmailVerificationToken.objects.get(token=token)
                
                if not email_token.is_valid():
                    return Response({
                        'error': 'Verification link has expired. Please request a new one.'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Mark email as verified
                user = email_token.user
                user.is_email_verified = True
                user.save(update_fields=['is_email_verified'])
                
                # Mark token as used
                email_token.is_used = True
                email_token.save(update_fields=['is_used'])
                
                return Response({
                    'message': 'Email verified successfully.',
                    'user': UserSerializer(user).data
                }, status=status.HTTP_200_OK)
                
            except EmailVerificationToken.DoesNotExist:
                return Response({
                    'error': 'Invalid verification token.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResendVerificationEmailView(APIView):
    """
    API endpoint to resend verification email.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        if user.is_email_verified:
            return Response({
                'message': 'Email is already verified.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Invalidate old tokens
        EmailVerificationToken.objects.filter(user=user, is_used=False).update(is_used=True)
        
        # Generate new token
        token = secrets.token_urlsafe(32)
        EmailVerificationToken.objects.create(
            user=user,
            token=token,
            expires_at=timezone.now() + timedelta(hours=24)
        )
        
        # Send verification email
        send_verification_email.delay(str(user.id), token)
        
        return Response({
            'message': 'Verification email sent.'
        }, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    """
    API endpoint to request password reset.
    
    Sends password reset email if user exists.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            try:
                user = User.objects.get(email__iexact=email)
                
                # Invalidate old tokens
                PasswordResetToken.objects.filter(user=user, is_used=False).update(is_used=True)
                
                # Generate new token
                token = secrets.token_urlsafe(32)
                PasswordResetToken.objects.create(
                    user=user,
                    token=token,
                    expires_at=timezone.now() + timedelta(hours=1)
                )
                
                # Send password reset email
                send_password_reset_email.delay(str(user.id), token)
                
            except User.DoesNotExist:
                pass  # Don't reveal if email exists
            
            return Response({
                'message': 'If an account with that email exists, we have sent a password reset link.'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    """
    API endpoint to confirm password reset.
    
    Validates token and sets new password.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        
        if serializer.is_valid():
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['password']
            
            try:
                reset_token = PasswordResetToken.objects.get(token=token)
                
                if not reset_token.is_valid():
                    return Response({
                        'error': 'Password reset link has expired. Please request a new one.'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Set new password
                user = reset_token.user
                user.set_password(new_password)
                user.save(update_fields=['password'])
                
                # Mark token as used
                reset_token.is_used = True
                reset_token.save(update_fields=['is_used'])
                
                return Response({
                    'message': 'Password reset successful. You can now login with your new password.'
                }, status=status.HTTP_200_OK)
                
            except PasswordResetToken.DoesNotExist:
                return Response({
                    'error': 'Invalid password reset token.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """
    API endpoint to change password for authenticated users.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save(update_fields=['password'])
            
            return Response({
                'message': 'Password changed successfully.'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    API endpoint to retrieve and update current user.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user


class CustomTokenRefreshView(TokenRefreshView):
    """
    Custom token refresh view.
    """
    pass
