'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { User, Camera, Edit2, MapPin } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge, SubscriptionBadge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Loading'
import { useAuthStore, useProfileStore } from '@/lib/store'

// Format value for display (convert snake_case to Title Case)
function formatValue(value: string | number | null | undefined): string {
  if (!value) return 'Not specified'
  if (typeof value === 'number') return value.toString()
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Format height from cm
function formatHeight(cm: number | null | undefined): string {
  if (!cm) return 'Not specified'
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return `${feet}'${inches}" (${cm} cm)`
}

// Format income
function formatIncome(income: string | null | undefined): string {
  if (!income) return 'Not specified'
  const incomeMap: Record<string, string> = {
    '0-3': 'Below 3 Lakh',
    '3-5': '3-5 Lakh',
    '5-10': '5-10 Lakh',
    '10-15': '10-15 Lakh',
    '15-25': '15-25 Lakh',
    '25-50': '25-50 Lakh',
    '50-75': '50-75 Lakh',
    '75-100': '75 Lakh - 1 Crore',
    '100+': 'Above 1 Crore',
  }
  return incomeMap[income] || formatValue(income)
}

// Format gender
function formatGender(gender: string | null | undefined): string {
  if (!gender) return 'Not specified'
  return gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : gender
}

// Format address
function formatAddress(state?: string, district?: string, area?: string): string {
  const parts = [area, district, state].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : 'Not specified'
}

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
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="text-center p-8">
          <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
          <p className="text-gray-500 mb-4">Set up your profile to find your match</p>
          <Link href="/profile/edit">
            <Button>Create Profile</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const photos = profile.photos || []
  const profilePhoto = photos.find((p) => p.is_primary) || photos[0]
  const completionPercentage = profile.profile_score || 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Profile Header */}
      <Card className="mb-4 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary-500 to-secondary-500" />
        <div className="px-4 pb-4">
          <div className="flex items-end gap-4 -mt-10">
            <div className="relative">
              <Avatar
                src={profilePhoto?.image_url}
                firstName={user?.first_name || ''}
                lastName={user?.last_name || ''}
                size="xl"
                className="ring-4 ring-white"
              />
              <Link
                href="/profile/photos"
                className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md"
              >
                <Camera className="h-3 w-3 text-gray-600" />
              </Link>
            </div>
            <div className="flex-1 pb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">
                  {user?.first_name} {user?.last_name}
                </h1>
                {user?.subscription_type && user.subscription_type !== 'free' && (
                  <SubscriptionBadge plan={user.subscription_type} />
                )}
              </div>
              {(profile.city || profile.district || profile.state) && (
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {[profile.city, profile.district, profile.state].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
            <Link href="/profile/edit">
              <Button variant="outline" size="sm">
                <Edit2 className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Profile completion */}
          {completionPercentage < 100 && (
            <div className="mt-4 p-3 bg-primary-50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">Profile Completion</span>
                <span className="text-xs font-bold text-primary-600">{completionPercentage}%</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600 rounded-full"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* About Me */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">About Me</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            {profile.about_me || 'No description added yet'}
          </p>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoItem label="Gender" value={formatGender(profile.gender)} />
            <InfoItem label="Age" value={profile.age ? `${profile.age} years` : null} />
            <InfoItem label="Date of Birth" value={profile.date_of_birth} />
            <InfoItem label="Height" value={formatHeight(profile.height_cm)} />
            <InfoItem label="Marital Status" value={formatValue(profile.marital_status)} />
            <InfoItem label="Phone Number" value={profile.phone_number} />
          </div>
        </CardContent>
      </Card>

      {/* Religious Background */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Religious Background</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoItem label="Religion" value={formatValue(profile.religion)} />
            <InfoItem label="Caste" value={profile.caste} />
            <InfoItem label="Sub-Caste" value={profile.sub_caste} />
            <InfoItem label="Gotra" value={profile.gotra} />
            <InfoItem label="Manglik" value={formatValue(profile.manglik)} />
            <InfoItem label="Star Sign" value={formatValue(profile.star_sign)} />
            <InfoItem label="Birth Time" value={profile.birth_time} />
            <InfoItem label="Birth Place" value={profile.birth_place} />
          </div>
        </CardContent>
      </Card>

      {/* Education & Career */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Education & Career</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoItem label="Education" value={formatValue(profile.education)} />
            <InfoItem label="Degree/College" value={profile.education_detail} />
            <InfoItem label="Profession" value={profile.profession} />
            <InfoItem label="Company" value={profile.company_name} />
            <InfoItem label="Annual Income" value={formatIncome(profile.annual_income)} />
          </div>
        </CardContent>
      </Card>

      {/* Family Details */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Family Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoItem label="Father's Name" value={profile.father_name} />
            <InfoItem label="Father's Occupation" value={profile.father_occupation} />
            <InfoItem label="Mother's Name" value={profile.mother_name} />
            <InfoItem label="Mother's Occupation" value={profile.mother_occupation} />
            <InfoItem label="Siblings" value={profile.siblings} />
            <InfoItem label="Family Type" value={formatValue(profile.family_type)} />
            <InfoItem label="Family Values" value={formatValue(profile.family_values)} />
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <dt className="text-xs text-gray-500 mb-1">Present Address</dt>
              <dd className="text-gray-900 font-medium">
                {formatAddress(profile.state, profile.district, profile.city)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 mb-1">Native Address</dt>
              <dd className="text-gray-900 font-medium">
                {formatAddress(profile.native_state, profile.native_district, profile.native_area)}
              </dd>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lifestyle */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Lifestyle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <InfoItem label="Diet" value={formatValue(profile.diet)} />
            <InfoItem label="Smoking" value={formatValue(profile.smoking)} />
            <InfoItem label="Drinking" value={formatValue(profile.drinking)} />
          </div>
        </CardContent>
      </Card>

      {/* Photos */}
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Photos ({photos.length})</CardTitle>
          <Link href="/profile/photos" className="text-primary-600 text-xs">
            Manage
          </Link>
        </CardHeader>
        <CardContent>
          {photos.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {photos.slice(0, 4).map((photo) => (
                <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image src={photo.image_url} alt="Photo" fill className="object-cover" />
                  {photo.is_primary && (
                    <Badge variant="primary" size="sm" className="absolute top-1 left-1 text-[10px]">
                      Main
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-2">No photos added</p>
              <Link href="/profile/photos">
                <Button variant="outline" size="sm">Add Photos</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Link href="/settings">
        <Button variant="outline" className="w-full">Settings</Button>
      </Link>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-gray-900 font-medium">{value || 'Not specified'}</dd>
    </div>
  )
}
