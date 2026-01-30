/**
 * SoulConnect API Client
 * Centralized axios instance with authentication interceptors
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import toast from 'react-hot-toast'

// API Base URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

// Token storage keys
const ACCESS_TOKEN_KEY = 'soulconnect_access_token'
const REFRESH_TOKEN_KEY = 'soulconnect_refresh_token'

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Token management utilities
export const tokenUtils = {
  getAccessToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(ACCESS_TOKEN_KEY)
    }
    return null
  },

  getRefreshToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(REFRESH_TOKEN_KEY)
    }
    return null
  },

  setTokens: (access: string, refresh: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, access)
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
    }
  },

  clearTokens: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    }
  },

  isAuthenticated: (): boolean => {
    return !!tokenUtils.getAccessToken()
  },
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenUtils.getAccessToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor for token refresh and error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Handle 401 errors - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = tokenUtils.getRefreshToken()
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          })

          const { access } = response.data
          tokenUtils.setTokens(access, refreshToken)

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access}`
          }
          return api(originalRequest)
        } catch (refreshError) {
          // Refresh failed - clear tokens and redirect to login
          tokenUtils.clearTokens()
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
          return Promise.reject(refreshError)
        }
      } else {
        // No refresh token - redirect to login
        tokenUtils.clearTokens()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }

    // Handle specific error codes
    if (error.response) {
      const status = error.response.status
      const data = error.response.data as { detail?: string; message?: string }

      switch (status) {
        case 400:
          // Bad request - validation errors
          break
        case 403:
          toast.error('You do not have permission to perform this action')
          break
        case 404:
          toast.error('Resource not found')
          break
        case 429:
          toast.error('Too many requests. Please try again later.')
          break
        case 500:
          toast.error('Server error. Please try again later.')
          break
        default:
          if (data?.detail || data?.message) {
            toast.error(data.detail || data.message || 'An error occurred')
          }
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.')
    }

    return Promise.reject(error)
  }
)

// API endpoints organized by feature
export const authAPI = {
  register: (data: {
    email: string
    password: string
    first_name: string
    last_name: string
    phone_number: string
    gender: string
    date_of_birth: string
  }) => api.post('/auth/register/', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login/', data),

  logout: (refreshToken: string) =>
    api.post('/auth/logout/', { refresh_token: refreshToken }),

  verifyEmail: (token: string) =>
    api.post('/auth/verify-email/', { token }),

  resendVerification: (email: string) =>
    api.post('/auth/resend-verification/', { email }),

  forgotPassword: (email: string) =>
    api.post('/auth/password-reset/', { email }),

  resetPassword: (data: { token: string; password: string }) =>
    api.post('/auth/password-reset/confirm/', data),

  changePassword: (data: { old_password: string; new_password: string }) =>
    api.post('/auth/change-password/', data),

  refreshToken: (refresh: string) =>
    api.post('/auth/token/refresh/', { refresh }),

  getCurrentUser: () => api.get('/auth/me/'),
}

export const profileAPI = {
  getMyProfile: () => api.get('/profiles/me/'),

  updateProfile: (data: Partial<ProfileData>) =>
    api.patch('/profiles/me/', data),

  getProfile: (id: string) => api.get(`/profiles/${id}/`),

  getPartnerPreferences: () => api.get('/profiles/preferences/'),

  updatePartnerPreferences: (data: Partial<PartnerPreferenceData>) =>
    api.patch('/profiles/preferences/', data),

  uploadPhoto: (formData: FormData) =>
    api.post('/profiles/photos/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deletePhoto: (id: string) => api.delete(`/profiles/photos/${id}/delete/`),

  setProfilePhoto: (id: string) =>
    api.post(`/profiles/photos/${id}/set-primary/`),

  submitGovernmentID: (formData: FormData) =>
    api.post('/profiles/verification/submit/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Profile Payment
  submitPayment: (formData: FormData) =>
    api.post('/profiles/payment/submit/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getPaymentStatus: () => api.get('/profiles/payment/status/'),

  getPaymentHistory: () => api.get('/profiles/payment/history/'),

  // Manager-only endpoints
  managerSearch: (params: ManagerSearchParams) =>
    api.get('/profiles/manager/search/', { params }),

  downloadProfilePDF: (profileId: string) =>
    api.get(`/profiles/manager/download/${profileId}/`, {
      responseType: 'blob',
    }),
}


// Type definitions - aligned with backend serializers
export interface ProfileData {
  full_name: string
  gender: string
  date_of_birth: string
  height_cm: number
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
  city: string
  district: string
  state: string
  country: string
  pincode: string
  native_state: string
  native_district: string
  native_area: string
  father_name: string
  father_occupation: string
  mother_name: string
  mother_occupation: string
  siblings: string
  family_type: string
  family_values: string
  diet: string
  smoking: string
  drinking: string
  manglik: string
  star_sign: string
  birth_time: string
  birth_place: string
  about_me: string
  phone_number: string
}

export interface PartnerPreferenceData {
  age_from: number
  age_to: number
  height_from: number
  height_to: number
  marital_status: string[]
  religion: string[]
  caste: string[]
  caste_no_bar: boolean
  education: string[]
  profession: string[]
  income_from: string
  income_to: string
  country: string[]
  state: string[]
  city: string[]
  diet: string[]
  smoking: string[]
  drinking: string[]
  manglik: string[]
  additional_preferences: string
}

export interface ManagerSearchParams {
  gender?: 'M' | 'F'
  age_from?: number
  age_to?: number
  height_from?: number
  height_to?: number
  religion?: string
  caste?: string
  education?: string
  profession?: string
  location?: string
  marital_status?: string
  diet?: string
  page?: number
}

export default api
