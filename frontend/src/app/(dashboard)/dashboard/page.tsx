'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, CheckCircle2, User } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Loading'
import { useAuthStore, useProfileStore } from '@/lib/store'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { profile, isLoading, fetchProfile } = useProfileStore()

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const profileScore = profile?.profile_score || 0
  const isProfileComplete = profileScore >= 100

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Welcome, {user?.first_name}!
        </h1>
        <p className="text-sm text-gray-600">Find your perfect match</p>
      </div>

      {/* Profile Status */}
      {isLoading ? (
        <Card className="p-8">
          <div className="flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        </Card>
      ) : !profile ? (
        /* No Profile - Create Profile */
        <Card className="p-8 text-center">
          <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">Create Your Profile</h2>
          <p className="text-sm text-gray-500 mb-4">
            Set up your profile to start finding your perfect match
          </p>
          <Link href="/profile/edit">
            <Button>Create Profile</Button>
          </Link>
        </Card>
      ) : isProfileComplete ? (
        /* Profile Completed */
        <Card className="p-8 text-center bg-green-50 border-green-100">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">Profile Completed!</h2>
          <p className="text-sm text-gray-600 mb-4">
            Your profile is complete. You're all set to find your perfect match.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/profile">
              <Button variant="outline">View Profile</Button>
            </Link>
            <Link href="/search">
              <Button>Browse Profiles</Button>
            </Link>
          </div>
        </Card>
      ) : (
        /* Profile Incomplete - Complete Profile */
        <Card className="p-8 text-center bg-primary-50 border-primary-100">
          <Sparkles className="h-12 w-12 text-primary-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">Complete Your Profile</h2>
          <p className="text-sm text-gray-600 mb-4">
            Your profile is {profileScore}% complete. Add more details to get better matches.
          </p>
          {/* Progress Bar */}
          <div className="max-w-xs mx-auto mb-6">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 rounded-full transition-all duration-300"
                style={{ width: `${profileScore}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{profileScore}% complete</p>
          </div>
          <Link href="/profile/edit">
            <Button>Complete Profile</Button>
          </Link>
        </Card>
      )}
    </div>
  )
}
