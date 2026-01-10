/**
 * SoulConnect Utility Functions
 * Common helper functions used throughout the application
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Tailwind class name merger utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date to readable string
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }
  
  return new Date(date).toLocaleDateString('en-IN', defaultOptions)
}

// Format date with time
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Format relative time (e.g., "2 hours ago")
export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)
  
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  
  return formatDate(date, { month: 'short', day: 'numeric' })
}

// Calculate age from date of birth
export function calculateAge(dateOfBirth: string | Date): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

// Format height from cm to feet and inches
export function formatHeight(cm: number): string {
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  
  return `${feet}'${inches}"`
}

// Convert feet/inches to cm
export function heightToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54)
}

// Format currency (INR)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format income range
export function formatIncome(income: string): string {
  const incomeMap: Record<string, string> = {
    '0-3': 'Below ₹3 Lakh',
    '3-5': '₹3-5 Lakh',
    '5-7': '₹5-7 Lakh',
    '7-10': '₹7-10 Lakh',
    '10-15': '₹10-15 Lakh',
    '15-20': '₹15-20 Lakh',
    '20-30': '₹20-30 Lakh',
    '30-50': '₹30-50 Lakh',
    '50-75': '₹50-75 Lakh',
    '75-100': '₹75 Lakh - ₹1 Crore',
    '100+': 'Above ₹1 Crore',
  }
  
  return incomeMap[income] || income
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

// Capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Format full name
export function formatName(firstName: string, lastName: string): string {
  return `${capitalize(firstName)} ${capitalize(lastName)}`
}

// Generate initials from name
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone number (Indian format)
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/
  return phoneRegex.test(phone.replace(/\D/g, ''))
}

// Format phone number
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
  }
  return phone
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Get file extension
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
}

// Check if file is an image
export function isImageFile(filename: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
  return imageExtensions.includes(getFileExtension(filename).toLowerCase())
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Parse query string
export function parseQueryString(search: string): Record<string, string> {
  const params = new URLSearchParams(search)
  const result: Record<string, string> = {}
  
  params.forEach((value, key) => {
    result[key] = value
  })
  
  return result
}

// Build query string
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  
  return searchParams.toString()
}

// Sleep/delay utility
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Check if value is empty (null, undefined, empty string, empty array)
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

// Deep clone object
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// Religion options for dropdown
export const RELIGIONS = [
  'Hindu',
  'Muslim',
  'Christian',
  'Sikh',
  'Jain',
  'Buddhist',
  'Parsi',
  'Jewish',
  'Other',
]

// Education levels
export const EDUCATION_LEVELS = [
  'High School',
  'Diploma',
  'Bachelors',
  'Masters',
  'Doctorate',
  'Professional Degree',
]

// Occupation categories
export const OCCUPATIONS = [
  'Software/IT',
  'Doctor',
  'Engineer',
  'Teacher/Professor',
  'Government Employee',
  'Business Owner',
  'Lawyer',
  'Chartered Accountant',
  'Banking/Finance',
  'Defense',
  'Civil Services',
  'Other',
]

// Marital status options
export const MARITAL_STATUS = [
  'Never Married',
  'Divorced',
  'Widowed',
  'Awaiting Divorce',
]

// Diet options
export const DIET_OPTIONS = [
  'Vegetarian',
  'Non-Vegetarian',
  'Eggetarian',
  'Vegan',
  'Jain',
]

// Body type options
export const BODY_TYPES = ['Slim', 'Average', 'Athletic', 'Heavy']

// Complexion options
export const COMPLEXIONS = ['Fair', 'Wheatish', 'Dark', 'Very Fair']

// Family type options
export const FAMILY_TYPES = ['Joint Family', 'Nuclear Family']

// Family status options
export const FAMILY_STATUS = ['Middle Class', 'Upper Middle Class', 'Rich', 'Affluent']

// Family values options
export const FAMILY_VALUES = ['Traditional', 'Moderate', 'Liberal']

// Indian states
export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Chandigarh',
]

// Annual income ranges
export const INCOME_RANGES = [
  { value: '0-3', label: 'Below ₹3 Lakh' },
  { value: '3-5', label: '₹3-5 Lakh' },
  { value: '5-7', label: '₹5-7 Lakh' },
  { value: '7-10', label: '₹7-10 Lakh' },
  { value: '10-15', label: '₹10-15 Lakh' },
  { value: '15-20', label: '₹15-20 Lakh' },
  { value: '20-30', label: '₹20-30 Lakh' },
  { value: '30-50', label: '₹30-50 Lakh' },
  { value: '50-75', label: '₹50-75 Lakh' },
  { value: '75-100', label: '₹75 Lakh - ₹1 Crore' },
  { value: '100+', label: 'Above ₹1 Crore' },
]
