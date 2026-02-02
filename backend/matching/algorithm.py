"""
Matching Algorithm for KSHATRIYAConnect.

Calculates compatibility scores based on partner preferences
and profile attributes.
"""

from datetime import date
from typing import List, Dict, Any
from profiles.models import Profile, PartnerPreference


class MatchingAlgorithm:
    """
    Matching algorithm that calculates compatibility scores
    between two profiles based on partner preferences.
    """
    
    # Weight factors for different criteria
    WEIGHTS = {
        'age': 15,
        'height': 10,
        'religion': 20,
        'caste': 10,
        'education': 10,
        'income': 10,
        'location': 10,
        'diet': 5,
        'marital_status': 10,
    }
    
    def calculate_age(self, dob: date) -> int:
        """Calculate age from date of birth."""
        today = date.today()
        return today.year - dob.year - (
            (today.month, today.day) < (dob.month, dob.day)
        )
    
    def calculate_compatibility(self, profile: Profile, target: Profile) -> Dict[str, Any]:
        """
        Calculate compatibility score between two profiles.
        
        Args:
            profile: The user's profile
            target: The target profile to compare against
            
        Returns:
            Dictionary with total score and breakdown
        """
        try:
            preferences = profile.partner_preferences
        except PartnerPreference.DoesNotExist:
            # No preferences set, return base score
            return {
                'total_score': 50,
                'breakdown': {},
                'is_match': False
            }
        
        score = 0
        breakdown = {}
        
        # Age compatibility
        age_score = self._check_age(preferences, target)
        score += age_score * self.WEIGHTS['age'] / 100
        breakdown['age'] = age_score
        
        # Height compatibility
        height_score = self._check_height(preferences, target)
        score += height_score * self.WEIGHTS['height'] / 100
        breakdown['height'] = height_score
        
        # Religion compatibility
        religion_score = self._check_religion(preferences, target)
        score += religion_score * self.WEIGHTS['religion'] / 100
        breakdown['religion'] = religion_score
        
        # Caste compatibility
        caste_score = self._check_caste(preferences, target)
        score += caste_score * self.WEIGHTS['caste'] / 100
        breakdown['caste'] = caste_score
        
        # Education compatibility
        education_score = self._check_education(preferences, target)
        score += education_score * self.WEIGHTS['education'] / 100
        breakdown['education'] = education_score
        
        # Location compatibility
        location_score = self._check_location(preferences, target)
        score += location_score * self.WEIGHTS['location'] / 100
        breakdown['location'] = location_score
        
        # Diet compatibility
        diet_score = self._check_diet(preferences, target)
        score += diet_score * self.WEIGHTS['diet'] / 100
        breakdown['diet'] = diet_score
        
        # Marital status compatibility
        marital_score = self._check_marital_status(preferences, target)
        score += marital_score * self.WEIGHTS['marital_status'] / 100
        breakdown['marital_status'] = marital_score
        
        # Normalize score to percentage
        total_weight = sum(self.WEIGHTS.values())
        normalized_score = (score / total_weight) * 100
        
        return {
            'total_score': round(normalized_score, 1),
            'breakdown': breakdown,
            'is_match': normalized_score >= 60  # Consider 60%+ as good match
        }
    
    def _check_age(self, preferences: PartnerPreference, target: Profile) -> int:
        """Check age compatibility."""
        target_age = self.calculate_age(target.date_of_birth)
        
        if preferences.age_from <= target_age <= preferences.age_to:
            return 100
        
        # Partial score for close matches
        if target_age < preferences.age_from:
            diff = preferences.age_from - target_age
        else:
            diff = target_age - preferences.age_to
        
        if diff <= 2:
            return 70
        elif diff <= 5:
            return 40
        return 0
    
    def _check_height(self, preferences: PartnerPreference, target: Profile) -> int:
        """Check height compatibility."""
        if not preferences.height_from or not preferences.height_to:
            return 100  # No preference, full score
        
        if preferences.height_from <= target.height_cm <= preferences.height_to:
            return 100
        
        # Partial score for close matches
        if target.height_cm < preferences.height_from:
            diff = preferences.height_from - target.height_cm
        else:
            diff = target.height_cm - preferences.height_to
        
        if diff <= 5:
            return 70
        elif diff <= 10:
            return 40
        return 0
    
    def _check_religion(self, preferences: PartnerPreference, target: Profile) -> int:
        """Check religion compatibility."""
        if not preferences.religion:
            return 100  # No preference
        
        if target.religion in preferences.religion:
            return 100
        return 0
    
    def _check_caste(self, preferences: PartnerPreference, target: Profile) -> int:
        """Check caste compatibility."""
        if preferences.caste_no_bar:
            return 100
        
        if not preferences.caste:
            return 100  # No preference
        
        if target.caste.lower() in [c.lower() for c in preferences.caste]:
            return 100
        return 50  # Partial score for different caste
    
    def _check_education(self, preferences: PartnerPreference, target: Profile) -> int:
        """Check education compatibility."""
        if not preferences.education:
            return 100  # No preference
        
        if target.education in preferences.education:
            return 100
        return 30
    
    def _check_location(self, preferences: PartnerPreference, target: Profile) -> int:
        """Check location compatibility."""
        score = 0
        
        # City match
        if preferences.city and target.city.lower() in [c.lower() for c in preferences.city]:
            score += 50
        elif not preferences.city:
            score += 25
        
        # State match
        if preferences.state and target.state.lower() in [s.lower() for s in preferences.state]:
            score += 30
        elif not preferences.state:
            score += 15
        
        # Country match
        if preferences.country:
            if target.country.lower() in [c.lower() for c in preferences.country]:
                score += 20
        else:
            score += 10
        
        return score
    
    def _check_diet(self, preferences: PartnerPreference, target: Profile) -> int:
        """Check diet compatibility."""
        if not preferences.diet:
            return 100  # No preference
        
        if target.diet in preferences.diet:
            return 100
        return 30
    
    def _check_marital_status(self, preferences: PartnerPreference, target: Profile) -> int:
        """Check marital status compatibility."""
        if not preferences.marital_status:
            return 100  # No preference
        
        if target.marital_status in preferences.marital_status:
            return 100
        return 0
    
    def get_recommended_profiles(
        self,
        profile: Profile,
        limit: int = 20,
        exclude_ids: List[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get recommended profiles based on compatibility.
        
        Args:
            profile: The user's profile
            limit: Maximum number of recommendations
            exclude_ids: Profile IDs to exclude
            
        Returns:
            List of profiles with compatibility scores
        """
        from matching.models import Like, Pass, Match
        from profiles.models import BlockedProfile
        
        # Get IDs to exclude
        exclude_ids = exclude_ids or []
        
        # Exclude liked profiles
        liked_ids = Like.objects.filter(
            from_profile=profile
        ).values_list('to_profile_id', flat=True)
        
        # Exclude passed profiles
        passed_ids = Pass.objects.filter(
            from_profile=profile
        ).values_list('to_profile_id', flat=True)
        
        # Exclude blocked profiles
        blocked_ids = BlockedProfile.objects.filter(
            blocker=profile
        ).values_list('blocked_id', flat=True)
        
        blockers_ids = BlockedProfile.objects.filter(
            blocked=profile
        ).values_list('blocker_id', flat=True)
        
        # Combine all exclusions
        all_excluded = set(exclude_ids) | set(liked_ids) | set(passed_ids) | set(blocked_ids) | set(blockers_ids)
        all_excluded.add(str(profile.id))
        
        # Get candidate profiles
        candidates = Profile.objects.filter(
            user__is_active=True,
            user__is_profile_approved=True,
            user__is_banned=False
        ).exclude(
            id__in=all_excluded
        )
        
        # Filter by opposite gender
        if profile.gender == 'M':
            candidates = candidates.filter(gender='F')
        else:
            candidates = candidates.filter(gender='M')
        
        # Calculate scores and sort
        scored_profiles = []
        for candidate in candidates[:100]:  # Limit initial pool
            compatibility = self.calculate_compatibility(profile, candidate)
            scored_profiles.append({
                'profile': candidate,
                'score': compatibility['total_score'],
                'breakdown': compatibility['breakdown'],
                'is_match': compatibility['is_match']
            })
        
        # Sort by score descending
        scored_profiles.sort(key=lambda x: x['score'], reverse=True)
        
        return scored_profiles[:limit]


# Singleton instance
matching_algorithm = MatchingAlgorithm()
