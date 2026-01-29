"""
Profile Models for SoulConnect.

Comprehensive profile models for matrimonial platform including
personal details, preferences, photos, and verification documents.
"""

import uuid
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Profile(models.Model):
    """
    Main profile model containing all personal and family details.
    """
    
    # Gender choices
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
    ]
    
    # Marital status choices
    MARITAL_STATUS_CHOICES = [
        ('never_married', 'Never Married'),
        ('divorced', 'Divorced'),
        ('widowed', 'Widowed'),
        ('awaiting_divorce', 'Awaiting Divorce'),
    ]
    
    # Religion choices (common in India)
    RELIGION_CHOICES = [
        ('hindu', 'Hindu'),
        ('muslim', 'Muslim'),
        ('christian', 'Christian'),
        ('sikh', 'Sikh'),
        ('buddhist', 'Buddhist'),
        ('jain', 'Jain'),
        ('parsi', 'Parsi'),
        ('jewish', 'Jewish'),
        ('other', 'Other'),
    ]
    
    # Diet choices
    DIET_CHOICES = [
        ('vegetarian', 'Vegetarian'),
        ('non_vegetarian', 'Non-Vegetarian'),
        ('eggetarian', 'Eggetarian'),
        ('vegan', 'Vegan'),
        ('jain', 'Jain (No Onion/Garlic)'),
    ]
    
    # Education level choices
    EDUCATION_CHOICES = [
        ('high_school', 'High School'),
        ('diploma', 'Diploma'),
        ('bachelors', "Bachelor's Degree"),
        ('masters', "Master's Degree"),
        ('doctorate', 'Doctorate/PhD'),
        ('professional', 'Professional Degree (CA, MBBS, etc.)'),
    ]
    
    # Income range choices (in INR lakhs per annum)
    INCOME_CHOICES = [
        ('0-3', 'Less than 3 Lakhs'),
        ('3-5', '3-5 Lakhs'),
        ('5-10', '5-10 Lakhs'),
        ('10-15', '10-15 Lakhs'),
        ('15-25', '15-25 Lakhs'),
        ('25-50', '25-50 Lakhs'),
        ('50-75', '50-75 Lakhs'),
        ('75-100', '75 Lakhs - 1 Crore'),
        ('100+', 'More than 1 Crore'),
    ]
    
    # Primary key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Link to User
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    
    # Basic Information
    full_name = models.CharField(max_length=100)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    date_of_birth = models.DateField()
    
    # Physical Attributes
    height_cm = models.PositiveIntegerField(
        validators=[MinValueValidator(120), MaxValueValidator(220)],
        help_text="Height in centimeters"
    )

    # Personal Details
    marital_status = models.CharField(max_length=20, choices=MARITAL_STATUS_CHOICES)
    religion = models.CharField(max_length=20, choices=RELIGION_CHOICES)
    caste = models.CharField(max_length=100, blank=True)
    sub_caste = models.CharField(max_length=100, blank=True)
    gotra = models.CharField(max_length=100, blank=True)

    # Education & Career
    education = models.CharField(max_length=50, choices=EDUCATION_CHOICES)
    education_detail = models.CharField(max_length=200, blank=True, help_text="Specific degree/college")
    profession = models.CharField(max_length=100)
    company_name = models.CharField(max_length=100, blank=True)
    annual_income = models.CharField(max_length=20, choices=INCOME_CHOICES)
    
    # Present Address
    state = models.CharField(max_length=100)
    district = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, help_text="City/Area")
    country = models.CharField(max_length=100, default='India')
    pincode = models.CharField(max_length=10, blank=True)

    # Native Address
    native_state = models.CharField(max_length=100, blank=True)
    native_district = models.CharField(max_length=100, blank=True)
    native_area = models.CharField(max_length=100, blank=True)

    # Family Details
    father_name = models.CharField(max_length=100, blank=True)
    father_occupation = models.CharField(max_length=100, blank=True)
    mother_name = models.CharField(max_length=100, blank=True)
    mother_occupation = models.CharField(max_length=100, blank=True)
    siblings = models.CharField(max_length=200, blank=True, help_text="e.g., 1 elder brother, 1 younger sister")
    family_type = models.CharField(
        max_length=20,
        choices=[('joint', 'Joint Family'), ('nuclear', 'Nuclear Family')],
        blank=True
    )
    family_values = models.CharField(
        max_length=20,
        choices=[('traditional', 'Traditional'), ('moderate', 'Moderate'), ('liberal', 'Liberal')],
        blank=True
    )
    
    # Lifestyle
    diet = models.CharField(max_length=20, choices=DIET_CHOICES)
    smoking = models.CharField(
        max_length=20,
        choices=[('no', 'No'), ('occasionally', 'Occasionally'), ('yes', 'Yes')],
        default='no'
    )
    drinking = models.CharField(
        max_length=20,
        choices=[('no', 'No'), ('occasionally', 'Occasionally'), ('yes', 'Yes')],
        default='no'
    )
    
    # Horoscope Details (Important for Indian matrimony)
    manglik = models.CharField(
        max_length=20,
        choices=[('yes', 'Yes'), ('no', 'No'), ('partial', 'Partial'), ('dont_know', "Don't Know")],
        blank=True
    )
    star_sign = models.CharField(max_length=50, blank=True)
    birth_time = models.TimeField(null=True, blank=True)
    birth_place = models.CharField(max_length=100, blank=True)
    
    # About Me
    about_me = models.TextField(max_length=2000, help_text="Tell us about yourself")
    
    # Contact Details (Hidden until match/premium)
    phone_number = models.CharField(max_length=15, blank=True)
    whatsapp_number = models.CharField(max_length=15, blank=True)
    
    # Profile Statistics
    profile_views = models.PositiveIntegerField(default=0)
    profile_score = models.PositiveIntegerField(default=0, help_text="Profile completeness score")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'profile'
        verbose_name_plural = 'profiles'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.full_name} ({self.user.email})"
    
    @property
    def age(self):
        """Calculate age from date of birth."""
        from datetime import date
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )
    
    @property
    def height_display(self):
        """Convert height to feet and inches for display."""
        feet = self.height_cm // 30.48
        inches = (self.height_cm % 30.48) / 2.54
        return f"{int(feet)}'{int(inches)}\""
    
    def calculate_profile_score(self):
        """Calculate profile completeness score (0-100)."""
        score = 0

        # Required fields (5 points each, 14 fields = 70 points max)
        required_fields = [
            'full_name', 'gender', 'date_of_birth', 'height_cm', 'marital_status',
            'religion', 'education', 'profession', 'annual_income',
            'city', 'state', 'district', 'diet', 'about_me'
        ]

        for field in required_fields:
            if getattr(self, field, None):
                score += 5

        # Optional fields (1 point each, 20 fields = 20 points max)
        optional_fields = [
            'caste', 'sub_caste', 'gotra', 'education_detail', 'company_name',
            'father_name', 'father_occupation', 'mother_name', 'mother_occupation',
            'siblings', 'family_type', 'family_values',
            'native_state', 'native_district', 'native_area',
            'birth_place', 'birth_time', 'phone_number', 'manglik', 'star_sign'
        ]

        for field in optional_fields:
            if getattr(self, field, None):
                score += 1

        # Bonus for photos (max 10 points) - count all photos, not just approved
        photo_count = self.photos.count()
        score += min(photo_count * 2, 10)

        self.profile_score = min(score, 100)
        self.save(update_fields=['profile_score'])
        return self.profile_score


class PartnerPreference(models.Model):
    """
    Partner preferences for matching algorithm.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.OneToOneField(
        Profile,
        on_delete=models.CASCADE,
        related_name='partner_preferences'
    )
    
    # Age preference
    age_from = models.PositiveIntegerField(
        validators=[MinValueValidator(18), MaxValueValidator(70)]
    )
    age_to = models.PositiveIntegerField(
        validators=[MinValueValidator(18), MaxValueValidator(70)]
    )
    
    # Height preference (in cm)
    height_from = models.PositiveIntegerField(
        validators=[MinValueValidator(120), MaxValueValidator(220)],
        null=True, blank=True
    )
    height_to = models.PositiveIntegerField(
        validators=[MinValueValidator(120), MaxValueValidator(220)],
        null=True, blank=True
    )
    
    # Marital status preference
    marital_status = models.JSONField(
        default=list,
        help_text="List of acceptable marital statuses"
    )
    
    # Religion preference
    religion = models.JSONField(
        default=list,
        help_text="List of acceptable religions"
    )
    
    # Caste preference
    caste = models.JSONField(
        default=list,
        blank=True,
        help_text="List of acceptable castes"
    )
    caste_no_bar = models.BooleanField(default=False)
    
    # Education preference
    education = models.JSONField(
        default=list,
        help_text="List of acceptable education levels"
    )
    
    # Profession preference
    profession = models.JSONField(
        default=list,
        blank=True,
        help_text="List of acceptable professions"
    )
    
    # Income preference
    income_from = models.CharField(max_length=20, blank=True)
    income_to = models.CharField(max_length=20, blank=True)
    
    # Location preference
    country = models.JSONField(default=list, blank=True)
    state = models.JSONField(default=list, blank=True)
    city = models.JSONField(default=list, blank=True)
    
    # Mother tongue preference
    mother_tongue = models.JSONField(default=list, blank=True)
    
    # Lifestyle preferences
    diet = models.JSONField(default=list, blank=True)
    smoking = models.JSONField(default=list, blank=True)
    drinking = models.JSONField(default=list, blank=True)
    
    # Horoscope preference
    manglik = models.JSONField(default=list, blank=True)
    
    # Additional notes
    additional_preferences = models.TextField(max_length=1000, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'partner preference'
        verbose_name_plural = 'partner preferences'
    
    def __str__(self):
        return f"Preferences for {self.profile.full_name}"


class ProfilePhoto(models.Model):
    """
    Profile photos model with moderation support.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='photos'
    )
    
    # Photo storage
    image = models.ImageField(upload_to='profile_photos/%Y/%m/')
    thumbnail = models.ImageField(upload_to='profile_photos/thumbnails/%Y/%m/', blank=True)
    
    # Photo details
    is_primary = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    is_rejected = models.BooleanField(default=False)
    rejection_reason = models.CharField(max_length=200, blank=True)
    
    # Order for display
    display_order = models.PositiveIntegerField(default=0)
    
    # Timestamps
    uploaded_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'profile photo'
        verbose_name_plural = 'profile photos'
        ordering = ['display_order', '-uploaded_at']
    
    def __str__(self):
        return f"Photo for {self.profile.full_name}"
    
    def save(self, *args, **kwargs):
        # If this is set as primary, unset other primary photos
        if self.is_primary:
            ProfilePhoto.objects.filter(
                profile=self.profile,
                is_primary=True
            ).exclude(id=self.id).update(is_primary=False)
        super().save(*args, **kwargs)


class GovernmentID(models.Model):
    """
    Government ID verification documents.
    """
    
    ID_TYPE_CHOICES = [
        ('aadhaar', 'Aadhaar Card'),
        ('pan', 'PAN Card'),
        ('passport', 'Passport'),
        ('driving_license', 'Driving License'),
        ('voter_id', 'Voter ID'),
    ]
    
    VERIFICATION_STATUS = [
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='government_ids'
    )
    
    # Document details
    id_type = models.CharField(max_length=20, choices=ID_TYPE_CHOICES)
    id_number = models.CharField(max_length=50)  # Encrypted in production
    document_front = models.ImageField(upload_to='verification_docs/%Y/%m/')
    document_back = models.ImageField(upload_to='verification_docs/%Y/%m/', blank=True)
    
    # Verification status
    status = models.CharField(max_length=20, choices=VERIFICATION_STATUS, default='pending')
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_ids'
    )
    rejection_reason = models.CharField(max_length=200, blank=True)
    
    # Timestamps
    submitted_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'government ID'
        verbose_name_plural = 'government IDs'
        ordering = ['-submitted_at']
    
    def __str__(self):
        return f"{self.get_id_type_display()} for {self.profile.full_name}"


class ProfileView(models.Model):
    """
    Track profile views for analytics and "Who viewed me" feature.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    viewer = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='profiles_viewed'
    )
    viewed_profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='profile_views_received'
    )
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'profile view'
        verbose_name_plural = 'profile views'
        ordering = ['-viewed_at']
        unique_together = ['viewer', 'viewed_profile', 'viewed_at']
    
    def __str__(self):
        return f"{self.viewer.full_name} viewed {self.viewed_profile.full_name}"


class BlockedProfile(models.Model):
    """
    Track blocked profiles.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    blocker = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='blocked_profiles'
    )
    blocked = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='blocked_by'
    )
    blocked_at = models.DateTimeField(auto_now_add=True)
    reason = models.TextField(blank=True)
    
    class Meta:
        verbose_name = 'blocked profile'
        verbose_name_plural = 'blocked profiles'
        unique_together = ['blocker', 'blocked']
    
    def __str__(self):
        return f"{self.blocker.full_name} blocked {self.blocked.full_name}"
