/**
 * Matches Page
 * View and manage matches
 */

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, MessageSquare, Star, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/Tabs'
import { ListSkeleton } from '@/components/ui/Loading'
import { NoMatchesEmpty, NoInterestsEmpty } from '@/components/ui/EmptyState'
import { matchingAPI } from '@/lib/api'
import { formatRelativeTime, calculateAge } from '@/lib/utils'

interface Match {
  id: string
  other_profile: {
    id: string
    user: {
      first_name: string
      last_name: string
    }
    photos: Array<{
      image_url: string
      is_primary: boolean
    }>
    date_of_birth: string
    city: string
    occupation: string
  }
  matched_at: string
  chat_unlocked: boolean
}

interface Interest {
  id: string
  from_profile?: {
    id: string
    user: {
      first_name: string
      last_name: string
    }
    photos: Array<{
      image_url: string
      is_primary: boolean
    }>
    date_of_birth: string
    city: string
  }
  to_profile?: {
    id: string
    user: {
      first_name: string
      last_name: string
    }
    photos: Array<{
      image_url: string
      is_primary: boolean
    }>
    date_of_birth: string
    city: string
  }
  message: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [receivedInterests, setReceivedInterests] = useState<Interest[]>([])
  const [sentInterests, setSentInterests] = useState<Interest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('matches')

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [matchesRes, receivedRes, sentRes] = await Promise.all([
          matchingAPI.getMatches(),
          matchingAPI.getReceivedInterests(),
          matchingAPI.getSentInterests(),
        ])
        setMatches(matchesRes.data.results || matchesRes.data)
        setReceivedInterests(receivedRes.data.results || receivedRes.data)
        setSentInterests(sentRes.data.results || sentRes.data)
      } catch (error) {
        console.error('Failed to load matches:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleAcceptInterest = async (interestId: string) => {
    try {
      await matchingAPI.respondToInterest(interestId, true)
      setReceivedInterests((prev) =>
        prev.map((i) =>
          i.id === interestId ? { ...i, status: 'accepted' } : i
        )
      )
    } catch (error) {
      console.error('Failed to accept interest:', error)
    }
  }

  const handleDeclineInterest = async (interestId: string) => {
    try {
      await matchingAPI.respondToInterest(interestId, false)
      setReceivedInterests((prev) =>
        prev.map((i) =>
          i.id === interestId ? { ...i, status: 'declined' } : i
        )
      )
    } catch (error) {
      console.error('Failed to decline interest:', error)
    }
  }

  const pendingInterests = receivedInterests.filter((i) => i.status === 'pending')

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Matches & Interests</h1>
        <p className="text-gray-500">Manage your connections</p>
      </div>

      <Tabs defaultValue="matches" onValueChange={setActiveTab}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="matches" className="flex-1">
            <Heart className="h-4 w-4 mr-2" />
            Matches ({matches.length})
          </TabsTrigger>
          <TabsTrigger value="received" className="flex-1 relative">
            <Star className="h-4 w-4 mr-2" />
            Received ({receivedInterests.length})
            {pendingInterests.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                {pendingInterests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex-1">
            <MessageSquare className="h-4 w-4 mr-2" />
            Sent ({sentInterests.length})
          </TabsTrigger>
        </TabsList>

        {/* Matches Tab */}
        <TabsContent value="matches">
          {isLoading ? (
            <ListSkeleton count={5} />
          ) : matches.length > 0 ? (
            <div className="space-y-4">
              {matches.filter(match => match.other_profile).map((match) => {
                const matchPhotos = match.other_profile?.photos || []
                const profilePhoto = matchPhotos.find((p) => p.is_primary) || matchPhotos[0]
                const age = match.other_profile?.date_of_birth ? calculateAge(match.other_profile.date_of_birth) : ''
                const firstName = match.other_profile?.user?.first_name || ''
                const lastName = match.other_profile?.user?.last_name || ''

                return (
                  <Card key={match.id} className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={profilePhoto?.image_url}
                        firstName={firstName}
                        lastName={lastName}
                        size="lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">
                          {firstName} {lastName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {age} yrs • {match.other_profile?.city || ''}
                        </p>
                        <p className="text-xs text-gray-400">
                          Matched {formatRelativeTime(match.matched_at)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/profile/${match.other_profile?.id}`}>
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                        </Link>
                        <Link href={`/chat?match=${match.id}`}>
                          <Button variant="primary" size="sm" leftIcon={<MessageSquare className="h-4 w-4" />}>
                            Chat
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <NoMatchesEmpty onExplore={() => window.location.href = '/search'} />
          )}
        </TabsContent>

        {/* Received Interests Tab */}
        <TabsContent value="received">
          {isLoading ? (
            <ListSkeleton count={5} />
          ) : receivedInterests.length > 0 ? (
            <div className="space-y-4">
              {receivedInterests.filter(i => i.from_profile).map((interest) => {
                const profile = interest.from_profile!
                const receivedPhotos = profile?.photos || []
                const profilePhoto = receivedPhotos.find((p) => p.is_primary) || receivedPhotos[0]
                const age = profile?.date_of_birth ? calculateAge(profile.date_of_birth) : ''
                const firstName = profile?.user?.first_name || ''
                const lastName = profile?.user?.last_name || ''

                return (
                  <Card key={interest.id} className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={profilePhoto?.image_url}
                        firstName={firstName}
                        lastName={lastName}
                        size="lg"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {firstName} {lastName}
                          </h3>
                          <Badge
                            variant={
                              interest.status === 'accepted'
                                ? 'success'
                                : interest.status === 'declined'
                                ? 'danger'
                                : 'warning'
                            }
                            size="sm"
                          >
                            {interest.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {age} yrs • {profile?.city}
                        </p>
                        {interest.message && (
                          <p className="text-sm text-gray-600 mt-1 italic">
                            "{interest.message}"
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatRelativeTime(interest.created_at)}
                        </p>
                      </div>
                      {interest.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeclineInterest(interest.id)}
                          >
                            Decline
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAcceptInterest(interest.id)}
                          >
                            Accept
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <NoInterestsEmpty type="received" />
          )}
        </TabsContent>

        {/* Sent Interests Tab */}
        <TabsContent value="sent">
          {isLoading ? (
            <ListSkeleton count={5} />
          ) : sentInterests.length > 0 ? (
            <div className="space-y-4">
              {sentInterests.filter(i => i.to_profile).map((interest) => {
                const profile = interest.to_profile!
                const sentPhotos = profile?.photos || []
                const profilePhoto = sentPhotos.find((p) => p.is_primary) || sentPhotos[0]
                const age = profile?.date_of_birth ? calculateAge(profile.date_of_birth) : ''
                const firstName = profile?.user?.first_name || ''
                const lastName = profile?.user?.last_name || ''

                return (
                  <Card key={interest.id} className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={profilePhoto?.image_url}
                        firstName={firstName}
                        lastName={lastName}
                        size="lg"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {firstName} {lastName}
                          </h3>
                          <Badge
                            variant={
                              interest.status === 'accepted'
                                ? 'success'
                                : interest.status === 'declined'
                                ? 'danger'
                                : 'default'
                            }
                            size="sm"
                          >
                            {interest.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {age} yrs • {profile?.city}
                        </p>
                        {interest.message && (
                          <p className="text-sm text-gray-600 mt-1 italic">
                            "{interest.message}"
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          Sent {formatRelativeTime(interest.created_at)}
                        </p>
                      </div>
                      <Link href={`/profile/${profile?.id}`}>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <NoInterestsEmpty type="sent" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
