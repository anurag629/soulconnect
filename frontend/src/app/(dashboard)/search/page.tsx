'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Filter, Download, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProfileCard, ProfileData } from '@/components/ProfileCard'
import { ProfileCardSkeleton } from '@/components/ui/Loading'
import { NoSearchResultsEmpty } from '@/components/ui/EmptyState'
import { profileAPI, ManagerSearchParams } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { debounce, RELIGIONS, MARITAL_STATUS, INDIAN_STATES } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Filters {
  gender: string
  age_from: string
  age_to: string
  religion: string
  marital_status: string
  location: string
}

const initialFilters: Filters = {
  gender: '',
  age_from: '18',
  age_to: '70',
  religion: '',
  marital_status: '',
  location: '',
}

export default function ManagerSearchPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [profiles, setProfiles] = useState<ProfileData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  // Check if user is manager
  useEffect(() => {
    if (user && !user.is_manager) {
      toast.error('Access denied. Manager access required.')
      router.push('/dashboard')
    }
  }, [user, router])

  const fetchProfiles = useCallback(async (currentFilters: Filters, pageNum: number) => {
    if (!user?.is_manager) return
    
    setIsLoading(true)
    try {
      const params: ManagerSearchParams = { page: pageNum }
      
      if (currentFilters.gender) params.gender = currentFilters.gender as 'M' | 'F'
      if (currentFilters.age_from) params.age_from = parseInt(currentFilters.age_from)
      if (currentFilters.age_to) params.age_to = parseInt(currentFilters.age_to)
      if (currentFilters.religion) params.religion = currentFilters.religion
      if (currentFilters.marital_status) params.marital_status = currentFilters.marital_status
      if (currentFilters.location) params.location = currentFilters.location

      const response = await profileAPI.managerSearch(params)
      const results = response.data.results || response.data || []

      if (pageNum === 1) {
        setProfiles(Array.isArray(results) ? results : [])
      } else {
        setProfiles((prev) => [...prev, ...(Array.isArray(results) ? results : [])])
      }
      setHasMore(!!response.data.next)
    } catch (error: any) {
      console.error('Failed to fetch profiles:', error)
      if (error.response?.status === 403) {
        toast.error('Access denied. Manager access required.')
        router.push('/dashboard')
      } else {
        toast.error('Failed to fetch profiles')
      }
    } finally {
      setIsLoading(false)
    }
  }, [user, router])

  const debouncedFetch = useCallback(
    debounce((f: Filters) => {
      setPage(1)
      fetchProfiles(f, 1)
    }, 500),
    [fetchProfiles]
  )

  useEffect(() => {
    if (user?.is_manager) {
      fetchProfiles(filters, 1)
    }
  }, [user])

  const handleFilterChange = (key: keyof Filters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    debouncedFetch(newFilters)
  }

  const clearFilters = () => {
    setFilters(initialFilters)
    setPage(1)
    fetchProfiles(initialFilters, 1)
  }

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchProfiles(filters, nextPage)
  }

  const handleDownloadPDF = async (profileId: string, profileName: string) => {
    setDownloadingId(profileId)
    try {
      const response = await profileAPI.downloadProfilePDF(profileId)
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `profile_${profileName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Profile downloaded successfully!')
    } catch (error: any) {
      console.error('Failed to download profile:', error)
      toast.error('Failed to download profile')
    } finally {
      setDownloadingId(null)
    }
  }

  // Show access denied if not manager
  if (user && !user.is_manager) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="text-center p-8">
          <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-4">Manager access required to view this page.</p>
          <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
        </Card>
      </div>
    )
  }

  const activeFiltersCount = [
    filters.gender,
    filters.religion,
    filters.marital_status,
    filters.location
  ].filter(Boolean).length

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Manager Search Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Search and manage all user profiles</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="primary">Manager Access</Badge>
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<Filter className="h-4 w-4" />}
          >
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="mb-4 p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <Select
              label="Gender"
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              options={[
                { value: '', label: 'All' },
                { value: 'M', label: 'Male' },
                { value: 'F', label: 'Female' },
              ]}
            />
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Age</label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.age_from}
                  onChange={(e) => handleFilterChange('age_from', e.target.value)}
                  className="!py-1.5 text-sm"
                />
                <span className="text-gray-400">-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.age_to}
                  onChange={(e) => handleFilterChange('age_to', e.target.value)}
                  className="!py-1.5 text-sm"
                />
              </div>
            </div>
            <Select
              label="Religion"
              value={filters.religion}
              onChange={(e) => handleFilterChange('religion', e.target.value)}
              options={[{ value: '', label: 'Any' }, ...RELIGIONS.map((r) => ({ value: r.toLowerCase(), label: r }))]}
            />
            <Select
              label="Marital Status"
              value={filters.marital_status}
              onChange={(e) => handleFilterChange('marital_status', e.target.value)}
              options={[{ value: '', label: 'Any' }, ...MARITAL_STATUS.map((m) => ({ value: m, label: m }))]}
            />
            <Select
              label="Location"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              options={[{ value: '', label: 'Any' }, ...INDIAN_STATES.map((s) => ({ value: s, label: s }))]}
            />
          </div>
          {activeFiltersCount > 0 && (
            <button onClick={clearFilters} className="mt-3 text-xs text-primary-600 hover:underline">
              Clear all filters
            </button>
          )}
        </Card>
      )}

      {/* Results */}
      {isLoading && page === 1 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <ProfileCardSkeleton key={i} />)}
        </div>
      ) : profiles.length > 0 ? (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Found {profiles.length} profile{profiles.length !== 1 ? 's' : ''}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile) => (
              <Card key={profile.id} className="overflow-hidden">
                <div
                  className="cursor-pointer"
                  onClick={() => router.push(`/profile/${profile.id}`)}
                >
                  <ProfileCard
                    profile={profile}
                    showActions={false}
                    onViewProfile={(id) => router.push(`/profile/${id}`)}
                  />
                </div>
                <div className="p-3 border-t bg-gray-50">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownloadPDF(profile.id, profile.full_name || 'Profile')
                    }}
                    disabled={downloadingId === profile.id}
                    leftIcon={<Download className="h-4 w-4" />}
                  >
                    {downloadingId === profile.id ? 'Downloading...' : 'Download Profile PDF'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          {hasMore && (
            <div className="text-center mt-6">
              <Button variant="outline" onClick={loadMore} isLoading={isLoading}>
                Load More
              </Button>
            </div>
          )}
        </>
      ) : (
        <NoSearchResultsEmpty onClear={clearFilters} />
      )}
    </div>
  )
}
