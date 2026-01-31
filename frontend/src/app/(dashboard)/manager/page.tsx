'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  CreditCard,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Loading'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { useAuthStore } from '@/lib/store'
import { managerAPI } from '@/lib/api'

interface DashboardStats {
  pending_profiles: number
  pending_payments: number
  pending_photos: number
  total_users: number
}

interface PendingProfile {
  id: string
  full_name: string
  email: string
  phone: string
  gender: string
  age: number
  photos_count: number
  profile_score: number
  created_at: string
}

interface PendingPayment {
  id: string
  profile_name: string
  profile_email: string
  amount: string
  transaction_id: string
  screenshot_url: string | null
  status: string
  submitted_at: string
}

export default function ManagerPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [profiles, setProfiles] = useState<PendingProfile[]>([])
  const [payments, setPayments] = useState<PendingPayment[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingProfiles, setLoadingProfiles] = useState(false)
  const [loadingPayments, setLoadingPayments] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Redirect non-managers
  useEffect(() => {
    if (user && !user.is_manager) {
      router.replace('/dashboard')
    }
  }, [user, router])

  const fetchStats = useCallback(async () => {
    try {
      const res = await managerAPI.getDashboard()
      setStats(res.data)
    } catch {
      toast.error('Failed to load dashboard stats')
    } finally {
      setLoadingStats(false)
    }
  }, [])

  const fetchProfiles = useCallback(async () => {
    setLoadingProfiles(true)
    try {
      const res = await managerAPI.getPendingProfiles()
      setProfiles(res.data.results ?? res.data)
    } catch {
      toast.error('Failed to load pending profiles')
    } finally {
      setLoadingProfiles(false)
    }
  }, [])

  const fetchPayments = useCallback(async () => {
    setLoadingPayments(true)
    try {
      const res = await managerAPI.getPendingPayments()
      setPayments(res.data.results ?? res.data)
    } catch {
      toast.error('Failed to load pending payments')
    } finally {
      setLoadingPayments(false)
    }
  }, [])

  useEffect(() => {
    if (user?.is_manager) {
      fetchStats()
    }
  }, [user, fetchStats])

  // --- Actions ---

  const handleApproveProfile = async (id: string) => {
    setActionLoading(id)
    try {
      await managerAPI.approveProfile(id)
      toast.success('Profile approved')
      setProfiles((prev) => prev.filter((p) => p.id !== id))
      setStats((prev) =>
        prev ? { ...prev, pending_profiles: prev.pending_profiles - 1 } : prev
      )
    } catch {
      toast.error('Failed to approve profile')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectProfile = async (id: string) => {
    setActionLoading(id)
    try {
      await managerAPI.rejectProfile(id)
      toast.success('Profile rejected')
      setProfiles((prev) => prev.filter((p) => p.id !== id))
      setStats((prev) =>
        prev ? { ...prev, pending_profiles: prev.pending_profiles - 1 } : prev
      )
    } catch {
      toast.error('Failed to reject profile')
    } finally {
      setActionLoading(null)
    }
  }

  const handleVerifyPayment = async (id: string) => {
    setActionLoading(id)
    try {
      await managerAPI.verifyPayment(id)
      toast.success('Payment verified')
      setPayments((prev) => prev.filter((p) => p.id !== id))
      setStats((prev) =>
        prev ? { ...prev, pending_payments: prev.pending_payments - 1 } : prev
      )
    } catch {
      toast.error('Failed to verify payment')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectPayment = async (id: string) => {
    const reason = prompt('Rejection reason (optional):') ?? ''
    setActionLoading(id)
    try {
      await managerAPI.rejectPayment(id, reason)
      toast.success('Payment rejected')
      setPayments((prev) => prev.filter((p) => p.id !== id))
      setStats((prev) =>
        prev ? { ...prev, pending_payments: prev.pending_payments - 1 } : prev
      )
    } catch {
      toast.error('Failed to reject payment')
    } finally {
      setActionLoading(null)
    }
  }

  if (!user?.is_manager) return null

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
        Manager Dashboard
      </h1>

      <Tabs
        defaultValue="overview"
        onValueChange={(val) => {
          if (val === 'profiles') fetchProfiles()
          if (val === 'payments') fetchPayments()
        }}
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profiles">Profiles</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        {/* ---- Overview ---- */}
        <TabsContent value="overview">
          {loadingStats ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard
                label="Pending Profiles"
                value={stats.pending_profiles}
                icon={<Users className="h-5 w-5 text-primary-600" />}
              />
              <StatCard
                label="Pending Payments"
                value={stats.pending_payments}
                icon={<CreditCard className="h-5 w-5 text-orange-500" />}
              />
              <StatCard
                label="Pending Photos"
                value={stats.pending_photos}
                icon={<ImageIcon className="h-5 w-5 text-blue-500" />}
              />
              <StatCard
                label="Total Users"
                value={stats.total_users}
                icon={<Users className="h-5 w-5 text-green-600" />}
              />
            </div>
          ) : null}
        </TabsContent>

        {/* ---- Profiles ---- */}
        <TabsContent value="profiles">
          {loadingProfiles ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : profiles.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-green-400 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">No pending profiles</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {profiles.map((p) => (
                <Card key={p.id} padding="sm" className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{p.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">{p.email}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge size="sm">{p.gender === 'M' ? 'Male' : 'Female'}</Badge>
                      <Badge size="sm">{p.age} yrs</Badge>
                      <Badge size="sm" variant="primary">Score {p.profile_score}</Badge>
                      <Badge size="sm">{p.photos_count} photos</Badge>
                      <span className="text-xs text-gray-400">{formatDate(p.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="primary"
                      isLoading={actionLoading === p.id}
                      onClick={() => handleApproveProfile(p.id)}
                      leftIcon={<CheckCircle2 className="h-4 w-4" />}
                      className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      isLoading={actionLoading === p.id}
                      onClick={() => handleRejectProfile(p.id)}
                      leftIcon={<XCircle className="h-4 w-4" />}
                    >
                      Reject
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ---- Payments ---- */}
        <TabsContent value="payments">
          {loadingPayments ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : payments.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-green-400 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">No pending payments</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {payments.map((pay) => (
                <Card key={pay.id} padding="sm" className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{pay.profile_name}</p>
                    <p className="text-xs text-gray-500 truncate">{pay.profile_email}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge size="sm" variant="primary">TXN: {pay.transaction_id}</Badge>
                      <Badge size="sm">Rs {pay.amount}</Badge>
                      <span className="text-xs text-gray-400">{formatDate(pay.submitted_at)}</span>
                    </div>
                    {pay.screenshot_url && (
                      <a
                        href={pay.screenshot_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline mt-1"
                      >
                        View Screenshot <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="primary"
                      isLoading={actionLoading === pay.id}
                      onClick={() => handleVerifyPayment(pay.id)}
                      leftIcon={<CheckCircle2 className="h-4 w-4" />}
                      className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
                    >
                      Verify
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      isLoading={actionLoading === pay.id}
                      onClick={() => handleRejectPayment(pay.id)}
                      leftIcon={<XCircle className="h-4 w-4" />}
                    >
                      Reject
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <Card padding="sm">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gray-50">{icon}</div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </Card>
  )
}
