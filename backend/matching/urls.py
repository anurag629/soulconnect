"""
URL configuration for matching app.
"""

from django.urls import path
from .views import (
    SendLikeView, SendPassView, LikesSentView, LikesReceivedView,
    MatchListView, UnmatchView,
    SendInterestView, InterestsSentView, InterestsReceivedView, RespondToInterestView,
    ShortlistView, RemoveFromShortlistView,
    RecommendedProfilesView, CompatibilityScoreView
)

app_name = 'matching'

urlpatterns = [
    # Likes
    path('like/', SendLikeView.as_view(), name='send_like'),
    path('pass/<uuid:profile_id>/', SendPassView.as_view(), name='send_pass'),
    path('likes/sent/', LikesSentView.as_view(), name='likes_sent'),
    path('likes/received/', LikesReceivedView.as_view(), name='likes_received'),
    
    # Matches
    path('matches/', MatchListView.as_view(), name='match_list'),
    path('matches/<uuid:match_id>/unmatch/', UnmatchView.as_view(), name='unmatch'),
    
    # Interests
    path('interest/', SendInterestView.as_view(), name='send_interest'),
    path('interests/sent/', InterestsSentView.as_view(), name='interests_sent'),
    path('interests/received/', InterestsReceivedView.as_view(), name='interests_received'),
    path('interests/<uuid:interest_id>/respond/', RespondToInterestView.as_view(), name='respond_interest'),
    
    # Shortlist
    path('shortlist/', ShortlistView.as_view(), name='shortlist'),
    path('shortlist/<uuid:profile_id>/remove/', RemoveFromShortlistView.as_view(), name='remove_shortlist'),
    
    # Recommendations
    path('recommendations/', RecommendedProfilesView.as_view(), name='recommendations'),
    path('compatibility/<uuid:profile_id>/', CompatibilityScoreView.as_view(), name='compatibility'),
]
