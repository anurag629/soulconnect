/**
 * Profile Verification Page
 * Allow users to verify their profile with different verification methods
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  XCircle,
  Upload,
  Camera,
  FileText,
  Shield,
  Phone,
  Mail
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/lib/store'
import { toast } from 'react-hot-toast'

interface VerificationMethod {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: 'pending' | 'verified' | 'not_started' | 'rejected'
  action?: string
}

export default function VerificationPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // For now, we'll show demo verification status
  // In production, this would come from the backend
  const verificationMethods: VerificationMethod[] = [
    {
      id: 'email',
      title: 'Email Verification',
      description: 'Verify your email address',
      icon: <Mail className="h-6 w-6" />,
      status: user?.is_email_verified ? 'verified' : 'not_started',
      action: 'Resend Email'
    },
    {
      id: 'phone',
      title: 'Phone Verification',
      description: 'Verify your phone number via OTP',
      icon: <Phone className="h-6 w-6" />,
      status: 'not_started',
      action: 'Verify Phone'
    },
    {
      id: 'photo',
      title: 'Photo Verification',
      description: 'Take a selfie to verify your identity',
      icon: <Camera className="h-6 w-6" />,
      status: 'not_started',
      action: 'Take Selfie'
    },
    {
      id: 'id',
      title: 'ID Verification',
      description: 'Upload a government-issued ID',
      icon: <FileText className="h-6 w-6" />,
      status: 'not_started',
      action: 'Upload ID'
    },
  ]

  const getStatusBadge = (status: VerificationMethod['status']) => {
    switch (status) {
      case 'verified':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Verified
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="danger" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            Not Started
          </Badge>
        )
    }
  }

  const handleVerification = async (methodId: string) => {
    switch (methodId) {
      case 'email':
        toast.success('Verification email sent! Check your inbox.')
        break
      case 'phone':
        toast('Phone verification coming soon!', { icon: '📱' })
        break
      case 'photo':
        toast('Photo verification coming soon!', { icon: '📷' })
        break
      case 'id':
        toast('ID verification coming soon!', { icon: '📄' })
        break
      default:
        break
    }
  }

  const verifiedCount = verificationMethods.filter(m => m.status === 'verified').length
  const totalMethods = verificationMethods.length
  const verificationProgress = Math.round((verifiedCount / totalMethods) * 100)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
        leftIcon={<ArrowLeft className="h-4 w-4" />}
      >
        Back
      </Button>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
          <Shield className="h-8 w-8 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Verify Your Profile</h1>
        <p className="text-gray-500 mt-2">
          Verified profiles get up to 3x more responses
        </p>
      </div>

      {/* Progress Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Verification Progress</span>
            <span className="text-sm font-semibold text-primary-600">
              {verifiedCount}/{totalMethods} Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${verificationProgress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Verification Methods */}
      <div className="space-y-4">
        {verificationMethods.map((method) => (
          <Card key={method.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  method.status === 'verified' 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {method.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{method.title}</h3>
                    {getStatusBadge(method.status)}
                  </div>
                  <p className="text-sm text-gray-500">{method.description}</p>
                </div>
                {method.status !== 'verified' && method.action && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVerification(method.id)}
                  >
                    {method.action}
                  </Button>
                )}
                {method.status === 'verified' && (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Benefits Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Benefits of Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Build Trust</p>
                <p className="text-sm text-gray-500">Verified profiles are trusted more by other users</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Get More Responses</p>
                <p className="text-sm text-gray-500">Verified profiles receive 3x more interest</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Priority in Search</p>
                <p className="text-sm text-gray-500">Appear higher in search results</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Verified Badge</p>
                <p className="text-sm text-gray-500">Display a trusted verification badge on your profile</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
