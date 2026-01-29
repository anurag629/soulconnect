'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Heart, Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useAuthStore, RegisterData } from '@/lib/store'

const registerSchema = z.object({
  first_name: z.string().min(2, 'Min 2 characters'),
  last_name: z.string().min(2, 'Min 2 characters'),
  email: z.string().email('Invalid email'),
  phone_number: z.string().regex(/^[6-9]\d{9}$/, 'Invalid 10-digit number'),
  gender: z.enum(['male', 'female'], { required_error: 'Required' }),
  date_of_birth: z.string().refine((date) => {
    const age = Math.floor((Date.now() - new Date(date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    return age >= 18 && age <= 70
  }, 'Must be 18-70 years old'),
  password: z.string().min(8, 'Min 8 characters'),
  terms: z.boolean().refine((val) => val, 'Required'),
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerUser, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { terms: false },
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
    if (success) router.push('/login?registered=true')
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-6">
          <Heart className="h-8 w-8 text-primary-600" fill="currentColor" />
          <span className="text-xl font-serif font-bold text-gray-900">
            Soul<span className="text-primary-600">Connect</span>
          </span>
        </Link>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-1 text-sm text-gray-600">Find your perfect match</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              placeholder="First"
              error={errors.first_name?.message}
              leftIcon={<User className="h-5 w-5" />}
              {...register('first_name')}
            />
            <Input
              label="Last Name"
              placeholder="Last"
              error={errors.last_name?.message}
              {...register('last_name')}
            />
          </div>

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            leftIcon={<Mail className="h-5 w-5" />}
            {...register('email')}
          />

          <Input
            label="Mobile"
            type="tel"
            placeholder="10-digit number"
            error={errors.phone_number?.message}
            leftIcon={<Phone className="h-5 w-5" />}
            {...register('phone_number')}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Gender"
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
              {...register('date_of_birth')}
            />
          </div>

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min 8 characters"
            error={errors.password?.message}
            leftIcon={<Lock className="h-5 w-5" />}
            rightIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            }
            {...register('password')}
          />

          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 mt-0.5 text-primary-600 border-gray-300 rounded"
              {...register('terms')}
            />
            <span className="text-xs text-gray-600">
              I agree to the <Link href="/terms" className="text-primary-600">Terms</Link> and{' '}
              <Link href="/privacy" className="text-primary-600">Privacy Policy</Link>
            </span>
          </label>
          {errors.terms && <p className="text-xs text-red-600">{errors.terms.message}</p>}

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary-600">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
