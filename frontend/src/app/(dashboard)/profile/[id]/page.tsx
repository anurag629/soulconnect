/**
 * Profile Detail Page
 * View another user's profile
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeft,
  Heart,
  X,
  MapPin,
  Briefcase,
  GraduationCap,
  User,
  Ruler,
  BookOpen,
  Users,
  Home,
  ChevronLeft,
  ChevronRight,
  Utensils,
  Cigarette,
  Wine,
  Star,
  Clock,
  Shield,
  Crown
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Loading'
import { profileAPI, matchingAPI } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface ProfilePhoto {
  id: string
  image_url: string
  thumbnail_url: string
  is_primary: boolean
  is_approved: boolean
}

interface ProfileUser {
  id: string
  first_name: string
  last_name: string
}

interface ProfileDetail {
  id: string
  user: ProfileUser
  full_name: string
  gender: string
  date_of_birth: string
  age: number
  height_cm: number
  height_display: string
  marital_status: string
  religion: string
  caste: string
  sub_caste: string
  gotra: string
  education: string
  education_detail: string
  profession: string
  company_name: string
  annual_income: string
  // Present Address
  state: string
  district: string
  city: string
  country: string
  // Native Address
  native_state: string
  native_district: string
  native_area: string
  // Family
  father_name: string
  father_occupation: string
  mother_name: string
  mother_occupation: string
  siblings: string
  family_type: string
  family_values: string
  // Lifestyle
  diet: string
  smoking: string
  drinking: string
  // Horoscope
  manglik: string
  star_sign: string
  birth_time: string
  birth_place: string
  // About
  about_me: string
  photos: ProfilePhoto[]
  is_verified: boolean
  is_premium: boolean
}

// Format value for display
function formatValue(value: string | null | undefined): string {
  if (!value || value === 'Not specified') return 'Not specified'
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Format income for display
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

// Format address
function formatAddress(city?: string, district?: string, state?: string): string {
  const parts = [city, district, state].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : 'Not specified'
}

export default function ProfileDetailPage() {
  const params = useParams()
  const router = useRouter()
  const profileId = params.id as string

  const [profile, setProfile] = useState<ProfileDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isLiking, setIsLiking] = useState(false)
  const [isPassing, setIsPassing] = useState(false)

  useEffect(() => {
    if (profileId) {
      fetchProfile()
    }
  }, [profileId])

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const response = await profileAPI.getProfile(profileId)
      setProfile(response.data)
    } catch (error: any) {
      console.error('Failed to fetch profile:', error)
      toast.error('Failed to load profile')
      router.back()
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async () => {
    if (!profile) return
    setIsLiking(true)
    try {
      const response = await matchingAPI.likeProfile(profile.id)
      if (response.data.is_match) {
        toast.success("It's a match!")
      } else {
        toast.success('Interest sent!')
      }
      router.back()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send interest')
    } finally {
      setIsLiking(false)
    }
  }

  const handlePass = async () => {
    if (!profile) return
    setIsPassing(true)
    try {
      await matchingAPI.passProfile(profile.id)
      toast.success('Profile passed')
      router.back()
    } catch (error: any) {
      toast.error('Failed to pass profile')
    } finally {
      setIsPassing(false)
    }
  }

  const nextPhoto = () => {
    if (profile && profile.photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev + 1) % profile.photos.length)
    }
  }

  const prevPhoto = () => {
    if (profile && profile.photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev - 1 + profile.photos.length) % profile.photos.length)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">Profile not found</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    )
  }

  const photos = profile.photos?.filter(p => p.is_approved) || []
  const currentPhoto = photos[currentPhotoIndex]
  const displayName = profile.full_name || `${profile.user?.first_name} ${profile.user?.last_name}`.trim()

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-bold text-gray-900">Profile</h1>
      </div>

      {/* Photo Section */}
      <Card className="mb-4 overflow-hidden">
        <div className="relative aspect-[4/5] sm:aspect-[3/4] bg-gray-100">
          {currentPhoto ? (
            <Image
              src={currentPhoto.image_url}
              alt={displayName}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <User className="h-20 w-20 text-gray-300" />
            </div>
          )}

          {/* Photo Navigation */}
          {photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition"
                aria-label="Next photo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Photo Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`w-2 h-2 rounded-full transition ${
                      index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                    aria-label={`Go to photo ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {profile.is_verified && (
              <Badge variant="success" className="flex items-center gap-1">
                <Shield className="h-3 w-3" /> Verified
              </Badge>
            )}
            {profile.is_premium && (
              <Badge variant="warning" className="flex items-center gap-1">
                <Crown className="h-3 w-3" /> Premium
              </Badge>
            )}
          </div>
        </div>

        {/* Basic Info Overlay */}
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {displayName}, {profile.age}
              </h2>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {formatAddress(profile.city, profile.district, profile.state)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* About Me */}
      {profile.about_me && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">About Me</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 whitespace-pre-line">{profile.about_me}</p>
          </CardContent>
        </Card>
      )}

      {/* Basic Information */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <DetailItem icon={<Ruler />} label="Height" value={profile.height_display} />
            <DetailItem icon={<User />} label="Marital Status" value={formatValue(profile.marital_status)} />
            <DetailItem icon={<BookOpen />} label="Religion" value={formatValue(profile.religion)} />
            <DetailItem icon={<Users />} label="Caste" value={profile.caste} />
            {profile.sub_caste && (
              <DetailItem icon={<Users />} label="Sub-Caste" value={profile.sub_caste} />
            )}
            {profile.gotra && (
              <DetailItem icon={<BookOpen />} label="Gotra" value={profile.gotra} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Education & Career */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Education & Career</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <DetailItem icon={<GraduationCap />} label="Education" value={formatValue(profile.education)} />
            {profile.education_detail && (
              <DetailItem icon={<GraduationCap />} label="Degree/College" value={profile.education_detail} />
            )}
            <DetailItem icon={<Briefcase />} label="Profession" value={profile.profession} />
            {profile.company_name && (
              <DetailItem icon={<Briefcase />} label="Company" value={profile.company_name} />
            )}
            <DetailItem icon={<Briefcase />} label="Annual Income" value={formatIncome(profile.annual_income)} />
          </div>
        </CardContent>
      </Card>

      {/* Family Details */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Family Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {profile.father_name && (
              <DetailItem icon={<User />} label="Father's Name" value={profile.father_name} />
            )}
            {profile.father_occupation && (
              <DetailItem icon={<Briefcase />} label="Father's Occupation" value={profile.father_occupation} />
            )}
            {profile.mother_name && (
              <DetailItem icon={<User />} label="Mother's Name" value={profile.mother_name} />
            )}
            {profile.mother_occupation && (
              <DetailItem icon={<Briefcase />} label="Mother's Occupation" value={profile.mother_occupation} />
            )}
            {profile.siblings && (
              <DetailItem icon={<Users />} label="Siblings" value={profile.siblings} />
            )}
            <DetailItem icon={<Home />} label="Family Type" value={formatValue(profile.family_type)} />
            <DetailItem icon={<Home />} label="Family Values" value={formatValue(profile.family_values)} />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Present Address</p>
              <p className="text-sm text-gray-900 font-medium">
                {formatAddress(profile.city, profile.district, profile.state)}
              </p>
            </div>
            {(profile.native_state || profile.native_district || profile.native_area) && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Native Address</p>
                <p className="text-sm text-gray-900 font-medium">
                  {formatAddress(profile.native_area, profile.native_district, profile.native_state)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lifestyle */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Lifestyle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <DetailItem icon={<Utensils />} label="Diet" value={formatValue(profile.diet)} />
            <DetailItem icon={<Cigarette />} label="Smoking" value={formatValue(profile.smoking)} />
            <DetailItem icon={<Wine />} label="Drinking" value={formatValue(profile.drinking)} />
          </div>
        </CardContent>
      </Card>

      {/* Horoscope Details */}
      {(profile.manglik || profile.star_sign || profile.birth_time || profile.birth_place) && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Horoscope Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {profile.manglik && (
                <DetailItem icon={<Star />} label="Manglik" value={formatValue(profile.manglik)} />
              )}
              {profile.star_sign && (
                <DetailItem icon={<Star />} label="Star Sign" value={formatValue(profile.star_sign)} />
              )}
              {profile.birth_time && (
                <DetailItem icon={<Clock />} label="Birth Time" value={profile.birth_time} />
              )}
              {profile.birth_place && (
                <DetailItem icon={<MapPin />} label="Birth Place" value={profile.birth_place} />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fixed Action Buttons at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={handlePass}
            isLoading={isPassing}
          >
            <X className="h-5 w-5 mr-2" />
            Pass
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={handleLike}
            isLoading={isLiking}
          >
            <Heart className="h-5 w-5 mr-2" />
            Like
          </Button>
        </div>
      </div>
    </div>
  )
}

// Helper component for detail items
function DetailItem({
  icon,
  label,
  value
}: {
  icon: React.ReactNode
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="text-gray-400 mt-0.5 flex-shrink-0">
        {React.cloneElement(icon as React.ReactElement, { className: 'h-4 w-4' })}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm text-gray-900 font-medium truncate">{value || 'Not specified'}</p>
      </div>
    </div>
  )
}
