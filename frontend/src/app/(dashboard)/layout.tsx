/**
 * Dashboard Layout
 * Main layout for authenticated users with header and navigation
 */

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { useAuthStore } from '@/lib/store'
import { PageLoading } from '@/components/ui/Loading'
import { tokenUtils } from '@/lib/api'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, isLoading, fetchCurrentUser } = useAuthStore()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Wait for store hydration from localStorage
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    // Only fetch user if we have a token
    if (isHydrated && tokenUtils.isAuthenticated()) {
      fetchCurrentUser()
    }
  }, [isHydrated, fetchCurrentUser])

  useEffect(() => {
    // Only redirect after hydration is complete and we've checked auth
    if (isHydrated && !isLoading && !tokenUtils.isAuthenticated()) {
      router.push('/login')
    }
  }, [isHydrated, isAuthenticated, isLoading, router])

  // Show loading while hydrating or fetching user
  if (!isHydrated || isLoading) {
    return <PageLoading message="Loading your profile..." />
  }

  // Check token exists (more reliable than store state during hydration)
  if (!tokenUtils.isAuthenticated()) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="pt-16">
        {children}
      </main>
    </div>
  )
}
