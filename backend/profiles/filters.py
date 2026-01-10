"""
Filters for profile search.
"""

from django_filters import rest_framework as filters
from django.db.models import Q
from datetime import date, timedelta
from .models import Profile


class ProfileFilter(filters.FilterSet):
    """
    Filter for searching profiles.
    """
    
    # Age filter (calculated from date_of_birth)
    age_min = filters.NumberFilter(method='filter_age_min')
    age_max = filters.NumberFilter(method='filter_age_max')
    
    # Height filter
    height_min = filters.NumberFilter(field_name='height_cm', lookup_expr='gte')
    height_max = filters.NumberFilter(field_name='height_cm', lookup_expr='lte')
    
    # Text-based filters
    religion = filters.MultipleChoiceFilter(
        field_name='religion',
        choices=Profile.RELIGION_CHOICES
    )
    marital_status = filters.MultipleChoiceFilter(
        field_name='marital_status',
        choices=Profile.MARITAL_STATUS_CHOICES
    )
    education = filters.MultipleChoiceFilter(
        field_name='education',
        choices=Profile.EDUCATION_CHOICES
    )
    diet = filters.MultipleChoiceFilter(
        field_name='diet',
        choices=Profile.DIET_CHOICES
    )
    
    # Location filters
    city = filters.CharFilter(lookup_expr='icontains')
    state = filters.CharFilter(lookup_expr='icontains')
    country = filters.CharFilter(lookup_expr='iexact')
    
    # Other filters
    caste = filters.CharFilter(lookup_expr='icontains')
    mother_tongue = filters.CharFilter(lookup_expr='icontains')
    profession = filters.CharFilter(lookup_expr='icontains')
    
    # Lifestyle filters
    smoking = filters.ChoiceFilter(
        choices=[('no', 'No'), ('occasionally', 'Occasionally'), ('yes', 'Yes')]
    )
    drinking = filters.ChoiceFilter(
        choices=[('no', 'No'), ('occasionally', 'Occasionally'), ('yes', 'Yes')]
    )
    
    # Income filter
    annual_income = filters.MultipleChoiceFilter(
        field_name='annual_income',
        choices=Profile.INCOME_CHOICES
    )
    
    # Verified filter
    verified_only = filters.BooleanFilter(method='filter_verified')
    
    # With photo filter
    with_photo = filters.BooleanFilter(method='filter_with_photo')
    
    class Meta:
        model = Profile
        fields = [
            'gender', 'religion', 'marital_status', 'education',
            'diet', 'city', 'state', 'country', 'caste',
            'mother_tongue', 'profession', 'smoking', 'drinking',
            'annual_income'
        ]
    
    def filter_age_min(self, queryset, name, value):
        """Filter by minimum age."""
        if value:
            max_dob = date.today() - timedelta(days=value * 365)
            return queryset.filter(date_of_birth__lte=max_dob)
        return queryset
    
    def filter_age_max(self, queryset, name, value):
        """Filter by maximum age."""
        if value:
            min_dob = date.today() - timedelta(days=(value + 1) * 365)
            return queryset.filter(date_of_birth__gte=min_dob)
        return queryset
    
    def filter_verified(self, queryset, name, value):
        """Filter verified profiles only."""
        if value:
            return queryset.filter(user__is_id_verified=True)
        return queryset
    
    def filter_with_photo(self, queryset, name, value):
        """Filter profiles with at least one approved photo."""
        if value:
            return queryset.filter(photos__is_approved=True).distinct()
        return queryset
