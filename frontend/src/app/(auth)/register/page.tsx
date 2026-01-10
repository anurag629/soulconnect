/**
 * Register Page
 * New user registration with validation
 */

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Heart, Mail, Lock, Eye, EyeOff, User, Phone, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useAuthStore, RegisterData } from '@/lib/store'

// Validation schema
const registerSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone_number: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
  gender: z.enum(['male', 'female'], { required_error: 'Please select your gender' }),
  date_of_birth: z.string().refine((date) => {
    const age = Math.floor((Date.now() - new Date(date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    return age >= 18 && age <= 70
  }, 'You must be between 18 and 70 years old'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirm_password: z.string(),
  terms: z.boolean().refine((val) => val === true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerUser, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [step, setStep] = useState(1)

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      terms: false,
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    const registerData: RegisterData = {
      email: data.email,
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
      phone_number: data.phone_number,
      gender: data.gender,
      date_of_birth: data.date_of_birth,
    }

    const success = await registerUser(registerData)
    if (success) {
      router.push('/login?registered=true')
    }
  }

  const handleNextStep = async () => {
    const fieldsToValidate = step === 1 
      ? ['first_name', 'last_name', 'email', 'phone_number'] as const
      : ['gender', 'date_of_birth', 'password', 'confirm_password', 'terms'] as const
    
    const isValid = await trigger(fieldsToValidate)
    if (isValid && step === 1) {
      setStep(2)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image/Illustration */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-secondary-400 to-primary-600 items-center justify-center p-12">
        <div className="max-w-md text-center text-white">
          <div className="w-64 h-64 mx-auto mb-8 bg-white/10 rounded-full flex items-center justify-center">
            <Heart className="h-32 w-32 text-white" />
          </div>
          <h2 className="text-3xl font-serif font-bold mb-4">
            Begin Your Journey to Forever
          </h2>
          <p className="text-white/90 text-lg">
            Create your profile and let us help you find a life partner who shares your values, 
            dreams, and vision for the future.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 justify-center text-left">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <span>100% verified profiles</span>
            </div>
            <div className="flex items-center gap-3 justify-center text-left">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <span>Advanced matching algorithm</span>
            </div>
            <div className="flex items-center gap-3 justify-center text-left">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <span>Safe and secure platform</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="h-10 w-10 text-primary-600" fill="currentColor" />
              <span className="text-2xl font-serif font-bold text-gray-900">
                Soul<span className="text-primary-600">Connect</span>
              </span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 font-serif">Create Account</h1>
            <p className="mt-2 text-gray-600">
              Join thousands of families finding happiness
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`h-2 w-16 rounded-full ${step >= 1 ? 'bg-primary-600' : 'bg-gray-200'}`} />
            <div className={`h-2 w-16 rounded-full ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    placeholder="First name"
                    error={errors.first_name?.message}
                    leftIcon={<User className="h-5 w-5" />}
                    {...register('first_name')}
                  />
                  <Input
                    label="Last Name"
                    placeholder="Last name"
                    error={errors.last_name?.message}
                    {...register('last_name')}
                  />
                </div>

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  leftIcon={<Mail className="h-5 w-5" />}
                  {...register('email')}
                />

                <Input
                  label="Mobile Number"
                  type="tel"
                  placeholder="10-digit mobile number"
                  error={errors.phone_number?.message}
                  leftIcon={<Phone className="h-5 w-5" />}
                  {...register('phone_number')}
                />

                <Button
                  type="button"
                  className="w-full"
                  size="lg"
                  onClick={handleNextStep}
                >
                  Continue
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Gender"
                    placeholder="Select gender"
                    options={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                    ]}
                    error={errors.gender?.message}
                    {...register('gender')}
                  />
                  <Input
                    label="Date of Birth"
                    type="date"
                    error={errors.date_of_birth?.message}
                    leftIcon={<Calendar className="h-5 w-5" />}
                    {...register('date_of_birth')}
                  />
                </div>

                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  error={errors.password?.message}
                  hint="At least 8 characters with uppercase, lowercase, and number"
                  leftIcon={<Lock className="h-5 w-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  }
                  {...register('password')}
                />

                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  error={errors.confirm_password?.message}
                  leftIcon={<Lock className="h-5 w-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  }
                  {...register('confirm_password')}
                />

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 mt-1 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    {...register('terms')}
                  />
                  <span className="text-sm text-gray-600">
                    I agree to the{' '}
                    <Link href="/terms" className="text-primary-600 hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary-600 hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-sm text-red-600">{errors.terms.message}</p>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    size="lg"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    size="lg"
                    isLoading={isLoading}
                  >
                    Create Account
                  </Button>
                </div>
              </>
            )}
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-primary-600 hover:text-primary-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
