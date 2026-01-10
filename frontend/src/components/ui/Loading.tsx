/**
 * Loading Components
 * Various loading states and spinners
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

// Spinner component
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <Loader2
      className={cn('animate-spin text-primary-600', sizes[size], className)}
    />
  )
}

// Full page loading
interface PageLoadingProps {
  message?: string
}

const PageLoading: React.FC<PageLoadingProps> = ({
  message = 'Loading...',
}) => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  )
}

// Inline loading
interface InlineLoadingProps {
  message?: string
  className?: string
}

const InlineLoading: React.FC<InlineLoadingProps> = ({
  message = 'Loading...',
  className,
}) => {
  return (
    <div className={cn('flex items-center justify-center py-8', className)}>
      <Spinner />
      <span className="ml-3 text-gray-600">{message}</span>
    </div>
  )
}

// Skeleton components for loading states
interface SkeletonProps {
  className?: string
}

const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={cn('animate-pulse rounded bg-gray-200', className)} />
  )
}

// Profile card skeleton
const ProfileCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <Skeleton className="h-64 w-full rounded-none" />
      <div className="p-6">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  )
}

// Chat message skeleton
const MessageSkeleton: React.FC = () => {
  return (
    <div className="flex gap-3 mb-4">
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-16 w-3/4 rounded-xl" />
      </div>
    </div>
  )
}

// List skeleton
interface ListSkeletonProps {
  count?: number
  className?: string
}

const ListSkeleton: React.FC<ListSkeletonProps> = ({
  count = 3,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-1/3 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Table skeleton
interface TableSkeletonProps {
  rows?: number
  columns?: number
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export {
  Spinner,
  PageLoading,
  InlineLoading,
  Skeleton,
  ProfileCardSkeleton,
  MessageSkeleton,
  ListSkeleton,
  TableSkeleton,
}
