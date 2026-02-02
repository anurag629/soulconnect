/**
 * Verify Email Page
 * Handles email verification via token from link
 */

'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2, Mail, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { authAPI } from '@/lib/api'
import toast from 'react-hot-toast'

type VerificationStatus = 'verifying' | 'success' | 'error' | 'expired'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<VerificationStatus>('verifying')
  const [errorMessage, setErrorMessage] = useState('')
  const [email, setEmail] = useState('')
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error')
        setErrorMessage('No verification token provided')
        return
      }

      try {
        const response = await authAPI.verifyEmail(token)
        setStatus('success')
        setEmail(response.data.email || '')
        toast.success('Email verified successfully!')
      } catch (error: any) {
        console.error('Verification failed:', error)
        const detail = error.response?.data?.detail || 'Verification failed'
        
        if (detail.toLowerCase().includes('expired')) {
          setStatus('expired')
        } else {
          setStatus('error')
        }
        setErrorMessage(detail)
      }
    }

    verifyEmail()
  }, [token])

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setIsResending(true)
    try {
      await authAPI.resendVerification(email)
      toast.success('Verification email sent! Please check your inbox.')
    } catch (error: any) {
      console.error('Failed to resend verification:', error)
      toast.error(error.response?.data?.detail || 'Failed to send verification email')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {/* Verifying State */}
          {status === 'verifying' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary-100 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying Your Email
              </h1>
              <p className="text-gray-600">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {/* Success State */}
          {status === 'success' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Email Verified!
              </h1>
              <p className="text-gray-600 mb-6">
                Your email has been successfully verified. You can now access all features of KSHATRIYAConnect.
              </p>
              <Link href="/login">
                <Button className="w-full">
                  Continue to Login
                </Button>
              </Link>
            </>
          )}

          {/* Error State */}
          {status === 'error' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verification Failed
              </h1>
              <p className="text-gray-600 mb-6">
                {errorMessage || 'We couldn\'t verify your email. The link may be invalid or already used.'}
              </p>
              <div className="space-y-3">
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Go to Login
                  </Button>
                </Link>
              </div>
            </>
          )}

          {/* Expired State */}
          {status === 'expired' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-yellow-100 flex items-center justify-center">
                <Mail className="h-8 w-8 text-yellow-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Link Expired
              </h1>
              <p className="text-gray-600 mb-6">
                This verification link has expired. Please request a new verification email.
              </p>

              <div className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <Button
                  onClick={handleResendVerification}
                  disabled={isResending || !email}
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Resend Verification Email
                    </>
                  )}
                </Button>
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
