/**
 * Profile Page
 * View and edit user's own profile
 */

'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  User,
  Camera,
  Edit2,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Users,
  CheckCircle,
  Shield,
  ChevronRight,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge, VerificationBadge, SubscriptionBadge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Loading'
import { useAuthStore, useProfileStore, Profile } from '@/lib/store'
import { calculateAge, formatHeight, formatIncome, formatDate } from '@/lib/utils'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const { profile, isLoading, fetchProfile } = useProfileStore()

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center p-12">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
          <p className="text-gray-500 mb-6">
            Set up your profile to start finding your perfect match
          </p>
          <Link href="/profile/edit">
            <Button>Create Profile</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const photos = profile.photos || []
  const profilePhoto = photos.find((p) => p.is_primary) || photos[0]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <Card className="mb-6 overflow-hidden">
        {/* Cover/Banner */}
        <div className="h-32 bg-gradient-to-r from-primary-500 to-secondary-500" />

        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16">
            {/* Profile Photo */}
            <div className="relative">
              <Avatar
                src={profilePhoto?.image_url}
                firstName={user?.first_name || ''}
                lastName={user?.last_name || ''}
                size="2xl"
                verified={user?.is_id_verified}
                className="ring-4 ring-white"
              />
              <Link
                href="/profile/photos"
                className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
              >
                <Camera className="h-4 w-4 text-gray-600" />
              </Link>
            </div>

            {/* Name and badges */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user?.first_name} {user?.last_name}
                </h1>
                {user?.subscription_type && (
                  <SubscriptionBadge plan={user.subscription_type} />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-gray-500">
                {profile.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.city}, {profile.state}
                  </span>
                )}
                <VerificationBadge verified={user?.is_id_verified || false} type="id" />
              </div>
            </div>

            {/* Edit button */}
            <Link href="/profile/edit">
              <Button variant="outline" leftIcon={<Edit2 className="h-4 w-4" />}>
                Edit Profile
              </Button>
            </Link>
          </div>

          {/* Profile completion */}
          {profile.completion_percentage < 100 && (
            <div className="mt-6 p-4 bg-primary-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Profile Completion
                </span>
                <span className="text-sm font-bold text-primary-600">
                  {profile.completion_percentage}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600 rounded-full transition-all duration-300"
                  style={{ width: `${profile.completion_percentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Complete your profile to get better matches!
              </p>
            </div>
          )}
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* About Me */}
          <Card>
            <CardHeader>
              <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.about_me ? (
                <p className="text-gray-600 whitespace-pre-wrap">{profile.about_me}</p>
              ) : (
                <p className="text-gray-400 italic">No description added yet</p>
              )}
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Age" value={profile.age?.toString() || calculateAge(user?.date_of_birth || '')} />
                <InfoItem label="Height" value={profile.height_display || formatHeight(profile.height_cm)} />
                <InfoItem label="Body Type" value={profile.body_type} />
                <InfoItem label="Complexion" value={profile.complexion} />
                <InfoItem label="Diet" value={profile.diet} />
                <InfoItem label="Smoking" value={profile.smoking} />
                <InfoItem label="Drinking" value={profile.drinking} />
                <InfoItem label="Marital Status" value={profile.marital_status || 'Not specified'} />
              </div>
            </CardContent>
          </Card>

          {/* Religious Background */}
          <Card>
            <CardHeader>
              <CardTitle>Religious Background</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Religion" value={profile.religion} />
                <InfoItem label="Caste" value={profile.caste || 'Not specified'} />
                <InfoItem label="Sub-caste" value={profile.sub_caste || 'Not specified'} />
                <InfoItem label="Star Sign" value={profile.star_sign || 'Not specified'} />
                <InfoItem label="Mother Tongue" value={profile.mother_tongue} />
                <InfoItem label="Manglik" value={profile.manglik ? 'Yes' : 'No'} />
              </div>
            </CardContent>
          </Card>

          {/* Education & Career */}
          <Card>
            <CardHeader>
              <CardTitle>Education & Career</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Education" value={profile.education} />
                <InfoItem label="Education Details" value={profile.education_detail || 'Not specified'} />
                <InfoItem label="Profession" value={profile.profession || 'Not specified'} />
                <InfoItem label="Company" value={profile.company_name || 'Not specified'} />
                <InfoItem label="Annual Income" value={formatIncome(profile.annual_income)} />
              </div>
            </CardContent>
          </Card>

          {/* Family Details */}
          <Card>
            <CardHeader>
              <CardTitle>Family Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Family Type" value={profile.family_type} />
                <InfoItem label="Family Values" value={profile.family_values} />
                <InfoItem label="Father's Occupation" value={profile.father_occupation || 'Not specified'} />
                <InfoItem label="Mother's Occupation" value={profile.mother_occupation || 'Not specified'} />
                <InfoItem label="Siblings" value={profile.siblings?.toString() || '0'} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Photos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Photos ({photos.length})</CardTitle>
              <Link href="/profile/photos" className="text-primary-600 text-sm hover:underline">
                Manage
              </Link>
            </CardHeader>
            <CardContent>
              {photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {photos.slice(0, 6).map((photo) => (
                    <div
                      key={photo.id}
                      className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                    >
                      <Image
                        src={photo.image_url}
                        alt="Profile photo"
                        fill
                        className="object-cover"
                      />
                      {photo.is_primary && (
                        <div className="absolute top-1 left-1">
                          <Badge variant="primary" size="sm">Profile</Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Camera className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No photos added</p>
                  <Link href="/profile/photos">
                    <Button variant="outline" size="sm" className="mt-2">
                      Add Photos
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Partner Preferences */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Partner Preferences</CardTitle>
              <Link href="/profile/preferences" className="text-primary-600 text-sm hover:underline">
                Edit
              </Link>
            </CardHeader>
            <CardContent>
              {profile.partner_preferences ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Age</span>
                    <span className="text-gray-900">
                      {profile.partner_preferences.age_from} - {profile.partner_preferences.age_to} yrs
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Height</span>
                    <span className="text-gray-900">
                      {formatHeight(profile.partner_preferences.height_from)} - {formatHeight(profile.partner_preferences.height_to)}
                    </span>
                  </div>
                  {profile.partner_preferences.religion && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Religion</span>
                      <span className="text-gray-900">
                        {profile.partner_preferences.religion}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-2">
                    Set your partner preferences for better matches
                  </p>
                  <Link href="/profile/preferences">
                    <Button variant="outline" size="sm">
                      Set Preferences
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-1">
                <Link
                  href="/profile/verification"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                >
                  <span className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">Verify Profile</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
                <Link
                  href="/subscription"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                >
                  <span className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">Upgrade Plan</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                >
                  <span className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">Account Settings</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Info item component
function InfoItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-gray-900 font-medium">{value || 'Not specified'}</dd>
    </div>
  )
}
