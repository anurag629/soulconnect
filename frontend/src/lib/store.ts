/**
 * SoulConnect Authentication Store
 * Zustand store for managing authentication state
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authAPI, tokenUtils } from './api'
import toast from 'react-hot-toast'

// User type definition
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone_number: string
  gender: 'male' | 'female'
  date_of_birth: string
  is_verified: boolean
  is_email_verified: boolean
  is_phone_verified: boolean
  is_id_verified: boolean
  is_profile_complete: boolean
  profile_photo: string | null
  subscription_type: 'free' | 'premium' | 'elite'
  created_at: string
}

// Registration data type
export interface RegisterData {
  email: string
  password: string
  first_name: string
  last_name: string
  phone_number: string
  gender: 'male' | 'female'
  date_of_birth: string
}

// Auth store state
interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => Promise<void>
  fetchCurrentUser: () => Promise<void>
  updateUser: (data: Partial<User>) => void
  clearError: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await authAPI.login({ email, password })
          const { tokens, user } = response.data

          // Store tokens
          tokenUtils.setTokens(tokens.access, tokens.refresh)

          // Update state
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })

          toast.success('Welcome back!')
          return true
        } catch (error: any) {
          const message = error.response?.data?.detail || 'Login failed. Please try again.'
          set({ error: message, isLoading: false })
          toast.error(message)
          return false
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null })

        try {
          const response = await authAPI.register(data)

          toast.success('Registration successful! Please check your email to verify your account.')
          set({ isLoading: false, error: null })
          return true
        } catch (error: any) {
          const errors = error.response?.data
          let message = 'Registration failed. Please try again.'

          if (errors) {
            // Handle field-specific errors
            if (errors.email) {
              message = `Email: ${errors.email[0]}`
            } else if (errors.phone_number) {
              message = `Phone: ${errors.phone_number[0]}`
            } else if (errors.password) {
              message = `Password: ${errors.password[0]}`
            } else if (errors.detail) {
              message = errors.detail
            }
          }

          set({ error: message, isLoading: false })
          toast.error(message)
          return false
        }
      },

      logout: async () => {
        set({ isLoading: true })

        try {
          const refreshToken = tokenUtils.getRefreshToken()
          if (refreshToken) {
            await authAPI.logout(refreshToken)
          }
        } catch (error) {
          // Ignore logout errors
        } finally {
          // Clear tokens and state
          tokenUtils.clearTokens()
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
          toast.success('Logged out successfully')
        }
      },

      fetchCurrentUser: async () => {
        if (!tokenUtils.isAuthenticated()) {
          set({ isAuthenticated: false, user: null })
          return
        }

        set({ isLoading: true })

        try {
          const response = await authAPI.getCurrentUser()
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          // Token might be invalid
          tokenUtils.clearTokens()
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      updateUser: (data: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...data } })
        }
      },

      clearError: () => set({ error: null }),

      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'soulconnect-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Profile store for user's own profile
export interface Profile {
  id: string
  user: string
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
  pincode: string
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
  manglik: string
  star_sign: string
  birth_time: string
  birth_place: string
  about_me: string
  phone_number: string
  whatsapp_number: string
  profile_views: number
  profile_score: number
  photos: ProfilePhoto[]
  is_verified: boolean
  is_premium: boolean
  created_at: string
  updated_at: string
}

export interface ProfilePhoto {
  id: string
  image_url: string
  thumbnail_url: string
  is_primary: boolean
  is_approved: boolean
  display_order: number
  uploaded_at: string
}

interface ProfileState {
  profile: Profile | null
  isLoading: boolean
  error: string | null

  fetchProfile: () => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<boolean>
  setProfile: (profile: Profile) => void
  clearProfile: () => void
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null })

    try {
      const { profileAPI } = await import('./api')
      const response = await profileAPI.getMyProfile()
      set({ profile: response.data, isLoading: false })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch profile',
        isLoading: false,
      })
    }
  },

  updateProfile: async (data: Partial<Profile>) => {
    set({ isLoading: true, error: null })

    try {
      const { profileAPI } = await import('./api')
      const response = await profileAPI.updateProfile(data)
      set({ profile: response.data, isLoading: false })
      toast.success('Profile updated successfully')
      return true
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to update profile'
      set({ error: message, isLoading: false })
      toast.error(message)
      return false
    }
  },

  setProfile: (profile: Profile) => set({ profile }),

  clearProfile: () => set({ profile: null, error: null }),
}))

// Subscription store
export interface Subscription {
  id: string
  plan: SubscriptionPlan
  status: 'active' | 'expired' | 'cancelled'
  start_date: string
  end_date: string
  auto_renew: boolean
}

export interface SubscriptionPlan {
  id: string
  name: string
  slug: string
  code: string
  price: number
  duration_months: number
  duration_days: number
  features: string[]
  is_popular: boolean
  max_daily_likes: number
  max_daily_messages: number
  can_see_profile_views: boolean
  can_see_who_liked: boolean
  priority_support: boolean
}

interface SubscriptionState {
  subscription: Subscription | null
  plans: SubscriptionPlan[]
  isLoading: boolean

  fetchSubscription: () => Promise<void>
  fetchPlans: () => Promise<void>
  setSubscription: (subscription: Subscription) => void
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  subscription: null,
  plans: [],
  isLoading: false,

  fetchSubscription: async () => {
    set({ isLoading: true })

    try {
      const { paymentAPI } = await import('./api')
      const response = await paymentAPI.getMySubscription()
      set({ subscription: response.data, isLoading: false })
    } catch (error) {
      set({ subscription: null, isLoading: false })
    }
  },

  fetchPlans: async () => {
    set({ isLoading: true })

    try {
      const { paymentAPI } = await import('./api')
      const response = await paymentAPI.getPlans()
      // Handle both paginated and non-paginated responses
      const plansData = response.data.results || response.data || []
      set({ plans: Array.isArray(plansData) ? plansData : [], isLoading: false })
    } catch (error) {
      set({ plans: [], isLoading: false })
    }
  },

  setSubscription: (subscription: Subscription) => set({ subscription }),
}))
