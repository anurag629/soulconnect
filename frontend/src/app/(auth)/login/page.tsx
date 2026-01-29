'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Heart, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/lib/store'
import { tokenUtils } from '@/lib/api'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (tokenUtils.isAuthenticated()) {
      router.push('/dashboard')
    }
  }, [router])

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    const success = await login(data.email, data.password)
    if (success) router.push('/dashboard')
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <Heart className="h-8 w-8 text-primary-600" fill="currentColor" />
          <span className="text-xl font-serif font-bold text-gray-900">
            Soul<span className="text-primary-600">Connect</span>
          </span>
        </Link>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-1 text-sm text-gray-600">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            leftIcon={<Mail className="h-5 w-5" />}
            {...register('email')}
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter password"
            error={errors.password?.message}
            leftIcon={<Lock className="h-5 w-5" />}
            rightIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            }
            {...register('password')}
          />

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-primary-600">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="font-semibold text-primary-600">
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}
