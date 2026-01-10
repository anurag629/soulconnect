/**
 * Auth Layout
 * Shared layout for authentication pages (login, register, forgot-password)
 */

import React from 'react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-neutral-50">
      {children}
    </div>
  )
}
