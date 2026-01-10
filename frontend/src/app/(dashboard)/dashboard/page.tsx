/**
 * Dashboard Page
 * Main dashboard showing recommendations and activity
 */

'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, Users, MessageSquare, Eye, TrendingUp, Star, ChevronRight, Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProfileCardSkeleton, ListSkeleton } from '@/components/ui/Loading'
import { ProfileCard, ProfileData } from '@/components/ProfileCard'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore, useProfileStore } from '@/lib/store'
import { matchingAPI, profileAPI, chatAPI } from '@/lib/api'
import { cn, formatRelativeTime } from '@/lib/utils'

interface DashboardStats {
  profileViews: number
  matches: number
  interests: number
  messages: number
}

interface ProfileView {
  id: string
  viewer: {
    first_name: string
    last_name: string
    profile_photo: string | null
  }
  viewed_at: string
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { profile, fetchProfile } = useProfileStore()
  const [recommendations, setRecommendations] = useState<ProfileData[]>([])
  const [profileViews, setProfileViews] = useState<ProfileView[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    profileViews: 0,
    matches: 0,
    interests: 0,
    messages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true)
      try {
        // Fetch all data in parallel
        const [recResponse, matchesResponse, receivedInterestsResponse, conversationsResponse, viewsResponse] = await Promise.all([
          matchingAPI.getRecommendations(),
          matchingAPI.getMatches(),
          matchingAPI.getReceivedInterests(),
          chatAPI.getConversations(),
          profileAPI.getProfileViews().catch(() => ({ data: [] })),
        ])

        // Set recommendations
        setRecommendations(recResponse.data.results?.slice(0, 6) || recResponse.data?.slice(0, 6) || [])

        // Set profile views
        const viewsData = viewsResponse.data.results || viewsResponse.data || []
        setProfileViews(viewsData.slice(0, 5))

        // Calculate stats
        const matchesData = matchesResponse.data.results || matchesResponse.data || []
        const interestsData = receivedInterestsResponse.data.results || receivedInterestsResponse.data || []
        const conversationsData = conversationsResponse.data.results || conversationsResponse.data || []
        
        // Count unread messages
        const unreadCount = conversationsData.reduce((sum: number, conv: any) => sum + (conv.unread_count || 0), 0)

        setStats({
          profileViews: viewsData.length,
          matches: matchesData.length,
          interests: interestsData.filter((i: any) => i.status === 'pending').length,
          messages: unreadCount,
        })

        // Fetch profile if not loaded
        if (!profile) {
          await fetchProfile()
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [user, profile, fetchProfile])

  const handleLike = async (profileId: string) => {
    try {
      await matchingAPI.likeProfile(profileId)
      setRecommendations((prev) => prev.filter((p) => p.id !== profileId))
    } catch (error) {
      console.error('Failed to like profile:', error)
    }
  }

  const handlePass = async (profileId: string) => {
    try {
      await matchingAPI.passProfile(profileId)
      setRecommendations((prev) => prev.filter((p) => p.id !== profileId))
    } catch (error) {
      console.error('Failed to pass profile:', error)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-serif">
          Welcome back, {user?.first_name}! 👋
        </h1>
        <p className="mt-1 text-gray-600">
          Here's what's happening with your profile today.
        </p>
      </div>

      {/* Profile Completion Alert */}
      {profile && profile.completion_percentage < 100 && (
        <Card className="mb-8 bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-100">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Complete Your Profile</h3>
                <p className="text-sm text-gray-600">
                  Your profile is {profile.completion_percentage}% complete. Add more details to get better matches!
                </p>
              </div>
            </div>
            <Link href="/profile/edit">
              <Button variant="primary" size="sm">
                Complete Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card padding="md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <Eye className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.profileViews}</p>
              <p className="text-sm text-gray-500">Profile Views</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.matches}</p>
              <p className="text-sm text-gray-500">Matches</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary-100 flex items-center justify-center">
              <Star className="h-6 w-6 text-secondary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.interests}</p>
              <p className="text-sm text-gray-500">Interests</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.messages}</p>
              <p className="text-sm text-gray-500">Messages</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recommendations Section */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
              <p className="text-sm text-gray-500">Based on your preferences</p>
            </div>
            <Link href="/search" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              View All
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <ProfileCardSkeleton key={i} />
              ))}
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-6">
              {recommendations.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  onLike={handleLike}
                  onPass={handlePass}
                />
              ))}
            </div>
          ) : (
            <Card padding="lg" className="text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No recommendations yet</h3>
              <p className="text-gray-500 text-sm mb-4">
                Complete your profile and preferences to get personalized matches.
              </p>
              <Link href="/profile/preferences">
                <Button variant="primary">Set Preferences</Button>
              </Link>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Views */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-gray-400" />
                Who Viewed You
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user?.subscription_type === 'free' ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-3">
                    Upgrade to see who viewed your profile
                  </p>
                  <Link href="/subscription">
                    <Button variant="outline" size="sm">
                      Upgrade Now
                    </Button>
                  </Link>
                </div>
              ) : isLoading ? (
                <ListSkeleton count={3} />
              ) : profileViews.length > 0 ? (
                <div className="space-y-3">
                  {profileViews.map((view) => (
                    <div key={view.id} className="flex items-center gap-3">
                      <Avatar
                        src={view.viewer.profile_photo}
                        firstName={view.viewer.first_name}
                        lastName={view.viewer.last_name}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {view.viewer.first_name} {view.viewer.last_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(view.viewed_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No profile views yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/profile/photos"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  📷
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Add Photos</p>
                  <p className="text-xs text-gray-500">Get 5x more views</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>

              <Link
                href="/profile/verification"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  ✓
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Verify Profile</p>
                  <p className="text-xs text-gray-500">Build more trust</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>

              <Link
                href="/profile/preferences"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center">
                  ⚙️
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Partner Preferences</p>
                  <p className="text-xs text-gray-500">Get better matches</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
            </CardContent>
          </Card>

          {/* Upgrade CTA (for free users) */}
          {user?.subscription_type === 'free' && (
            <Card className="bg-gradient-to-br from-primary-600 to-primary-700 text-white">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-10 w-10 mx-auto mb-4 opacity-80" />
                <h3 className="font-bold text-lg mb-2">Upgrade to Premium</h3>
                <p className="text-primary-100 text-sm mb-4">
                  Get unlimited chats, see who liked you, and more premium features.
                </p>
                <Link href="/subscription">
                  <Button variant="secondary" className="w-full">
                    View Plans
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
