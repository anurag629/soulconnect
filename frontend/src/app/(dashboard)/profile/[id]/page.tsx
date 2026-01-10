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
  MessageSquare, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  User,
  Calendar,
  Ruler,
  Globe,
  BookOpen,
  Users,
  DollarSign,
  Home,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge, VerificationBadge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Spinner } from '@/components/ui/Loading'
import { profileAPI, matchingAPI } from '@/lib/api'
import { calculateAge, formatHeight, formatIncome } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface ProfilePhoto {
  id: string
  image_url: string
  is_primary: boolean
}

interface ProfileDetail {
  id: string
  user: {
    id: string
    first_name: string
    last_name: string
  }
  photos: ProfilePhoto[]
  about_me: string
  date_of_birth: string
  height_cm: number
  religion: string
  caste: string
  mother_tongue: string
  marital_status: string
  education: string
  profession: string
  annual_income: string
  city: string
  state: string
  country: string
  family_type: string
  family_status: string
  father_occupation: string
  mother_occupation: string
  siblings: string
  is_verified: boolean
  is_premium: boolean
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
        toast.success("It's a match! 🎉")
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

  const handleChat = () => {
    if (!profile) return
    router.push(`/chat?profile=${profile.id}`)
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
      <div className="max-w-4xl mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Profile not found</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  const photos = profile.photos || []
  const currentPhoto = photos[currentPhotoIndex] || photos[0]
  const age = calculateAge(profile.date_of_birth)
  const firstName = profile.user?.first_name || ''
  const lastName = profile.user?.last_name || ''
  const fullName = `${firstName} ${lastName}`.trim()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
        leftIcon={<ArrowLeft className="h-4 w-4" />}
      >
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Photo Section */}
        <div className="relative">
          <Card className="overflow-hidden">
            <div className="relative aspect-[3/4] bg-gray-100">
              {currentPhoto ? (
                <Image
                  src={currentPhoto.image_url}
                  alt={fullName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <User className="h-24 w-24 text-gray-300" />
                </div>
              )}

              {/* Photo Navigation */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  {/* Photo Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                    {photos.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`w-2 h-2 rounded-full ${
                          index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {profile.is_verified && <VerificationBadge verified={true} />}
                {profile.is_premium && (
                  <Badge variant="warning">Premium</Badge>
                )}
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={handlePass}
              isLoading={isPassing}
              leftIcon={<X className="h-5 w-5" />}
            >
              Pass
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={handleLike}
              isLoading={isLiking}
              leftIcon={<Heart className="h-5 w-5" />}
            >
              Like
            </Button>
          </div>
        </div>

        {/* Profile Details */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-serif">
                  {fullName}, {age}
                </h1>
                <p className="text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4" />
                  {profile.city}, {profile.state}
                </p>
              </div>
            </div>

            {profile.about_me && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">About</h3>
                <p className="text-gray-700">{profile.about_me}</p>
              </div>
            )}
          </Card>

          {/* Personal Details */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Personal Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem icon={<Ruler className="h-4 w-4" />} label="Height" value={formatHeight(profile.height_cm)} />
              <DetailItem icon={<BookOpen className="h-4 w-4" />} label="Religion" value={profile.religion} />
              <DetailItem icon={<Users className="h-4 w-4" />} label="Caste" value={profile.caste || 'Not specified'} />
              <DetailItem icon={<Globe className="h-4 w-4" />} label="Mother Tongue" value={profile.mother_tongue} />
              <DetailItem icon={<User className="h-4 w-4" />} label="Marital Status" value={profile.marital_status} />
            </div>
          </Card>

          {/* Education & Career */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Education & Career</h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem icon={<GraduationCap className="h-4 w-4" />} label="Education" value={profile.education} />
              <DetailItem icon={<Briefcase className="h-4 w-4" />} label="Profession" value={profile.profession} />
              <DetailItem icon={<DollarSign className="h-4 w-4" />} label="Income" value={formatIncome(profile.annual_income)} />
            </div>
          </Card>

          {/* Family Details */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Family Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem icon={<Home className="h-4 w-4" />} label="Family Type" value={profile.family_type || 'Not specified'} />
              <DetailItem icon={<Users className="h-4 w-4" />} label="Family Status" value={profile.family_status || 'Not specified'} />
              <DetailItem icon={<Briefcase className="h-4 w-4" />} label="Father's Occupation" value={profile.father_occupation || 'Not specified'} />
              <DetailItem icon={<Briefcase className="h-4 w-4" />} label="Mother's Occupation" value={profile.mother_occupation || 'Not specified'} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Helper component for detail items
function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="text-gray-400 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm text-gray-900">{value || 'Not specified'}</p>
      </div>
    </div>
  )
}
