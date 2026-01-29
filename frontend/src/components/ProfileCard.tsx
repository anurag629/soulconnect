/**
 * ProfileCard Component
 * Display profile in card format for browsing/matching
 */

'use client'

import React from 'react'
import Image from 'next/image'
import { Heart, X, Star, MapPin, Briefcase, GraduationCap, Info } from 'lucide-react'
import { cn, calculateAge, formatHeight, formatIncome } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { Badge, VerificationBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export interface ProfileData {
  id: string
  user: {
    id: string
    first_name: string
    last_name: string
  }
  full_name?: string
  photos: Array<{
    id: string
    image_url: string
    is_primary: boolean
    is_approved?: boolean
  }>
  about_me: string
  date_of_birth: string
  age?: number
  height_cm?: number
  height_display?: string
  religion: string
  caste: string
  sub_caste?: string
  education: string
  profession: string
  annual_income: string
  city: string
  district?: string
  state: string
  is_verified: boolean
  is_premium?: boolean
  compatibility_score?: number
}

interface ProfileCardProps {
  profile: ProfileData
  variant?: 'default' | 'compact' | 'detailed'
  showActions?: boolean
  onLike?: (id: string) => void
  onPass?: (id: string) => void
  onSuperLike?: (id: string) => void
  onViewProfile?: (id: string) => void
  className?: string
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  variant = 'default',
  showActions = true,
  onLike,
  onPass,
  onSuperLike,
  onViewProfile,
  className,
}) => {
  // Safety check for undefined profile or user
  if (!profile || !profile.user) {
    return null
  }

  const photos = (profile.photos || []).filter(p => p.is_approved !== false)
  const profilePhoto = photos.find((p) => p.is_primary) || photos[0]
  const age = profile.age || calculateAge(profile.date_of_birth)
  const heightFormatted = profile.height_display || formatHeight(profile.height_cm || 0)
  const firstName = profile.user.first_name || ''
  const lastName = profile.user.last_name || ''
  const displayName = profile.full_name || `${firstName} ${lastName}`.trim()

  // Compact variant for lists
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-4 hover:shadow-md transition-shadow cursor-pointer',
          className
        )}
        onClick={() => onViewProfile?.(profile.id)}
      >
        <Avatar
          src={profilePhoto?.image_url}
          firstName={firstName}
          lastName={lastName}
          size="lg"
          verified={profile.is_verified}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {firstName} {lastName}
            </h3>
            {profile.compatibility_score && (
              <Badge variant="primary" size="sm">
                {profile.compatibility_score}% match
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {age} yrs, {heightFormatted} • {profile.religion}
          </p>
          <p className="text-sm text-gray-500 truncate">
            {profile.profession} • {profile.city}, {profile.state}
          </p>
        </div>
        {showActions && (
          <div className="flex flex-col gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onLike?.(profile.id)
              }}
              className="p-2 rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
            >
              <Heart className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    )
  }

  // Detailed variant for profile view
  if (variant === 'detailed') {
    return (
      <div className={cn('bg-white rounded-2xl shadow-lg overflow-hidden', className)}>
        {/* Photo Gallery */}
        <div className="relative h-96 bg-gray-100">
          {profilePhoto ? (
            <Image
              src={profilePhoto.image_url}
              alt={`${firstName}'s photo`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <Avatar
                firstName={firstName}
                lastName={lastName}
                size="2xl"
              />
            </div>
          )}
          {profile.is_verified && (
            <div className="absolute top-4 right-4">
              <VerificationBadge verified type="id" />
            </div>
          )}
          {profile.compatibility_score && (
            <div className="absolute top-4 left-4">
              <Badge variant="primary" size="lg">
                {profile.compatibility_score}% Compatible
              </Badge>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {firstName} {lastName}, {age}
              </h2>
              <p className="text-gray-500 flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {profile.city}, {profile.state}
              </p>
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Education</p>
                <p className="text-sm font-medium text-gray-900">{profile.education}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-50 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-secondary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Profession</p>
                <p className="text-sm font-medium text-gray-900">{profile.profession}</p>
              </div>
            </div>
          </div>

          {/* About */}
          {profile.about_me && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{profile.about_me}</p>
            </div>
          )}

          {/* Details */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="default">{heightFormatted}</Badge>
            <Badge variant="default">{profile.religion}</Badge>
            {profile.caste && <Badge variant="default">{profile.caste}</Badge>}
            <Badge variant="default">{formatIncome(profile.annual_income)}</Badge>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => onPass?.(profile.id)}
                leftIcon={<X className="h-5 w-5" />}
              >
                Pass
              </Button>
              <Button
                variant="outline"
                onClick={() => onSuperLike?.(profile.id)}
                leftIcon={<Star className="h-5 w-5" />}
              >
                Super Like
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => onLike?.(profile.id)}
                leftIcon={<Heart className="h-5 w-5" />}
              >
                Like
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Default card variant (for grid view)
  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-lg overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300',
        className
      )}
      onClick={() => onViewProfile?.(profile.id)}
    >
      {/* Photo */}
      <div className="relative h-64 bg-gray-100 overflow-hidden">
        {profilePhoto ? (
          <Image
            src={profilePhoto.image_url}
            alt={`${firstName}'s photo`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <Avatar
              firstName={firstName}
              lastName={lastName}
              size="2xl"
            />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {profile.is_verified && (
            <Badge variant="success" size="sm">
              Verified
            </Badge>
          )}
          {profile.compatibility_score && (
            <Badge variant="primary" size="sm">
              {profile.compatibility_score}%
            </Badge>
          )}
        </div>

        {/* Quick info on image */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="text-lg font-bold">
            {firstName}, {age}
          </h3>
          <p className="text-sm text-white/90 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {profile.city}
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge variant="default" size="sm">{profile.religion}</Badge>
          <Badge variant="default" size="sm">{profile.education}</Badge>
          <Badge variant="default" size="sm">{heightFormatted}</Badge>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {profile.about_me || `${profile.profession} • ${formatIncome(profile.annual_income)}`}
        </p>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPass?.(profile.id)
              }}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <X className="h-4 w-4" />
              Pass
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onLike?.(profile.id)
              }}
              className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Heart className="h-4 w-4" />
              Like
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export { ProfileCard }
