/**
 * Profile Photos Page
 * Manage profile photos - upload, delete, set as primary
 */

'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronLeft,
  Upload,
  Trash2,
  Star,
  Camera,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Loading'
import { useProfileStore } from '@/lib/store'
import { profileAPI } from '@/lib/api'
import { cn } from '@/lib/utils'

interface Photo {
  id: string
  image_url: string
  is_primary: boolean
  is_approved: boolean
  uploaded_at: string
}

const MAX_PHOTOS = 6

export default function ProfilePhotosPage() {
  const { profile, fetchProfile } = useProfileStore()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadPhotos = async () => {
      setIsLoading(true)
      try {
        await fetchProfile()
      } catch (error) {
        console.error('Failed to fetch photos:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadPhotos()
  }, [fetchProfile])

  useEffect(() => {
    if (profile?.photos) {
      setPhotos(profile.photos)
    }
  }, [profile])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or WebP image')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    // Check max photos limit
    if (photos.length >= MAX_PHOTOS) {
      toast.error(`You can upload a maximum of ${MAX_PHOTOS} photos`)
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      await profileAPI.uploadPhoto(formData)
      await fetchProfile()
      toast.success('Photo uploaded successfully!')
    } catch (error: any) {
      console.error('Failed to upload photo:', error)
      toast.error(error.response?.data?.detail || 'Failed to upload photo')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (photoId: string) => {
    setDeletingId(photoId)
    try {
      await profileAPI.deletePhoto(photoId)
      await fetchProfile()
      toast.success('Photo deleted successfully!')
    } catch (error: any) {
      console.error('Failed to delete photo:', error)
      toast.error(error.response?.data?.detail || 'Failed to delete photo')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSetProfilePhoto = async (photoId: string) => {
    setSettingPrimaryId(photoId)
    try {
      await profileAPI.setProfilePhoto(photoId)
      await fetchProfile()
      toast.success('Profile photo updated!')
    } catch (error: any) {
      console.error('Failed to set profile photo:', error)
      toast.error(error.response?.data?.detail || 'Failed to set profile photo')
    } finally {
      setSettingPrimaryId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/profile">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Manage Photos</h1>
        </div>
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || photos.length >= MAX_PHOTOS}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Photo
            </>
          )}
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Photo Guidelines */}
      <Card className="mb-6 bg-blue-50 border-blue-100">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Photo Guidelines:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Upload clear, recent photos of yourself</li>
                <li>Face should be clearly visible</li>
                <li>Avoid group photos or photos with sunglasses</li>
                <li>Maximum 6 photos, each under 5MB</li>
                <li>JPG, PNG, or WebP formats only</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photos Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <Card
            key={photo.id}
            className={cn(
              'overflow-hidden relative group',
              photo.is_primary && 'ring-2 ring-primary-500'
            )}
          >
            <div className="aspect-square relative">
              <Image
                src={photo.image_url}
                alt="Profile photo"
                fill
                className="object-cover"
              />

              {/* Profile Photo Badge */}
              {photo.is_primary && (
                <div className="absolute top-2 left-2 bg-primary-500 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Profile Photo
                </div>
              )}

              {/* Approval Status */}
              {!photo.is_approved && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                  Pending Review
                </div>
              )}

              {/* Action Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!photo.is_primary && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSetProfilePhoto(photo.id)}
                    disabled={settingPrimaryId === photo.id}
                    className="bg-white hover:bg-gray-100"
                  >
                    {settingPrimaryId === photo.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Star className="h-4 w-4 mr-1" />
                        Set as Primary
                      </>
                    )}
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(photo.id)}
                  disabled={deletingId === photo.id}
                >
                  {deletingId === photo.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {/* Empty Slots */}
        {Array.from({ length: Math.max(0, MAX_PHOTOS - photos.length) }).map(
          (_, index) => (
            <Card
              key={`empty-${index}`}
              className="border-dashed cursor-pointer hover:border-primary-300 hover:bg-primary-50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="aspect-square flex flex-col items-center justify-center text-gray-400">
                <Camera className="h-8 w-8 mb-2" />
                <p className="text-sm">Add Photo</p>
              </div>
            </Card>
          )
        )}
      </div>

      {/* Photo Count */}
      <p className="text-center text-gray-500 mt-6">
        {photos.length} of {MAX_PHOTOS} photos uploaded
      </p>
    </div>
  )
}
