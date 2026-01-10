/**
 * Avatar Component
 * Profile avatar with fallback initials
 */

'use client'

import React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn, getInitials } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  alt?: string
  firstName?: string
  lastName?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  verified?: boolean
  online?: boolean
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  firstName = '',
  lastName = '',
  size = 'md',
  className,
  verified = false,
  online = false,
}) => {
  const sizes = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-14 w-14 text-lg',
    xl: 'h-20 w-20 text-xl',
    '2xl': 'h-28 w-28 text-2xl',
  }

  const badgeSizes = {
    xs: 'h-2 w-2',
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
    xl: 'h-5 w-5',
    '2xl': 'h-6 w-6',
  }

  const verifiedSizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-7 w-7',
    '2xl': 'h-8 w-8',
  }

  const initials = getInitials(firstName, lastName)

  return (
    <div className="relative inline-block">
      <AvatarPrimitive.Root
        className={cn(
          'relative flex shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-primary-100 to-secondary-100',
          sizes[size],
          className
        )}
      >
        <AvatarPrimitive.Image
          src={src || undefined}
          alt={alt || `${firstName} ${lastName}`}
          className="aspect-square h-full w-full object-cover"
        />
        <AvatarPrimitive.Fallback
          className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600 text-white font-semibold"
          delayMs={600}
        >
          {initials || '?'}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>

      {/* Online indicator */}
      {online && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full bg-green-500 ring-2 ring-white',
            badgeSizes[size]
          )}
        />
      )}

      {/* Verified badge */}
      {verified && (
        <div
          className={cn(
            'absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full bg-blue-500 text-white ring-2 ring-white',
            verifiedSizes[size]
          )}
        >
          <svg
            className="h-3/5 w-3/5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  )
}

// Avatar Group for showing multiple avatars
interface AvatarGroupProps {
  avatars: Array<{
    src?: string | null
    firstName?: string
    lastName?: string
  }>
  max?: number
  size?: 'sm' | 'md' | 'lg'
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 4,
  size = 'md',
}) => {
  const visibleAvatars = avatars.slice(0, max)
  const remainingCount = avatars.length - max

  const overlapSizes = {
    sm: '-ml-2',
    md: '-ml-3',
    lg: '-ml-4',
  }

  return (
    <div className="flex items-center">
      {visibleAvatars.map((avatar, index) => (
        <div
          key={index}
          className={cn(
            'relative ring-2 ring-white rounded-full',
            index > 0 && overlapSizes[size]
          )}
        >
          <Avatar
            src={avatar.src}
            firstName={avatar.firstName}
            lastName={avatar.lastName}
            size={size}
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'relative flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-medium ring-2 ring-white',
            overlapSizes[size],
            size === 'sm' && 'h-8 w-8 text-xs',
            size === 'md' && 'h-10 w-10 text-sm',
            size === 'lg' && 'h-14 w-14 text-base'
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
}

export { Avatar, AvatarGroup }
