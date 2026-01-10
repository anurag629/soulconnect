/**
 * Badge Component
 * Small status indicators and labels
 */

import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
}

const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-primary-100 text-primary-700',
    secondary: 'bg-secondary-100 text-secondary-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    outline: 'bg-transparent border border-gray-300 text-gray-700',
  }

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  }

  const dotColors = {
    default: 'bg-gray-400',
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    outline: 'bg-gray-400',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full', dotColors[variant])}
        />
      )}
      {children}
    </span>
  )
}

// Subscription Badge
interface SubscriptionBadgeProps {
  plan: 'free' | 'premium' | 'elite'
  size?: 'sm' | 'md' | 'lg'
}

const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({
  plan,
  size = 'md',
}) => {
  const plans = {
    free: { label: 'Free', variant: 'default' as const },
    premium: { label: 'Premium', variant: 'primary' as const },
    elite: { label: 'Elite', variant: 'secondary' as const },
  }

  const { label, variant } = plans[plan]

  return (
    <Badge variant={variant} size={size}>
      {label}
    </Badge>
  )
}

// Verification Badge
interface VerificationBadgeProps {
  verified: boolean
  type?: 'profile' | 'email' | 'phone' | 'id'
  size?: 'sm' | 'md' | 'lg'
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  verified,
  type = 'profile',
  size = 'md',
}) => {
  const labels = {
    profile: verified ? 'Verified' : 'Unverified',
    email: verified ? 'Email Verified' : 'Email Pending',
    phone: verified ? 'Phone Verified' : 'Phone Pending',
    id: verified ? 'ID Verified' : 'ID Pending',
  }

  return (
    <Badge
      variant={verified ? 'success' : 'warning'}
      size={size}
      dot
    >
      {labels[type]}
    </Badge>
  )
}

export { Badge, SubscriptionBadge, VerificationBadge }
