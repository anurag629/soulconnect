'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProfileCard, ProfileData } from '@/components/ProfileCard'
import { ProfileCardSkeleton } from '@/components/ui/Loading'
import { NoSearchResultsEmpty } from '@/components/ui/EmptyState'
import { profileAPI, matchingAPI } from '@/lib/api'
import { debounce, RELIGIONS, MARITAL_STATUS, INDIAN_STATES } from '@/lib/utils'

interface Filters {
  age_from: string
  age_to: string
  religion: string
  marital_status: string
  location: string
}

const initialFilters: Filters = {
  age_from: '18',
  age_to: '40',
  religion: '',
  marital_status: '',
  location: '',
}

export default function SearchPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<ProfileData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchProfiles = useCallback(async (currentFilters: Filters, pageNum: number) => {
    setIsLoading(true)
    try {
      const params: any = { page: pageNum }
      if (currentFilters.age_from) params.age_from = parseInt(currentFilters.age_from)
      if (currentFilters.age_to) params.age_to = parseInt(currentFilters.age_to)
      if (currentFilters.religion) params.religion = currentFilters.religion
      if (currentFilters.marital_status) params.marital_status = currentFilters.marital_status
      if (currentFilters.location) params.location = currentFilters.location

      const response = await profileAPI.searchProfiles(params)
      const results = response.data.results || []

      if (pageNum === 1) {
        setProfiles(results)
      } else {
        setProfiles((prev) => [...prev, ...results])
      }
      setHasMore(!!response.data.next)
    } catch (error) {
      console.error('Failed to fetch profiles:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const debouncedFetch = useCallback(
    debounce((f: Filters) => {
      setPage(1)
      fetchProfiles(f, 1)
    }, 500),
    [fetchProfiles]
  )

  useEffect(() => {
    fetchProfiles(filters, 1)
  }, [])

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

  const handleLike = async (profileId: string) => {
    try {
      await matchingAPI.likeProfile(profileId)
      setProfiles((prev) => prev.filter((p) => p.id !== profileId))
    } catch (error) {
      console.error('Failed to like:', error)
    }
  }

  const handlePass = async (profileId: string) => {
    try {
      await matchingAPI.passProfile(profileId)
      setProfiles((prev) => prev.filter((p) => p.id !== profileId))
    } catch (error) {
      console.error('Failed to pass:', error)
    }
  }

  const activeFiltersCount = [filters.religion, filters.marital_status, filters.location].filter(Boolean).length

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Browse Profiles</h1>
        <Button
          variant={showFilters ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          leftIcon={<Filter className="h-4 w-4" />}
        >
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="mb-4 p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
              options={[{ value: '', label: 'Any' }, ...RELIGIONS.map((r) => ({ value: r, label: r }))]}
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
            <button onClick={clearFilters} className="mt-3 text-xs text-primary-600">
              Clear all filters
            </button>
          )}
        </Card>
      )}

      {/* Results */}
      {isLoading && page === 1 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <ProfileCardSkeleton key={i} />)}
        </div>
      ) : profiles.length > 0 ? (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onLike={handleLike}
                onPass={handlePass}
                onViewProfile={(id) => router.push(`/profile/${id}`)}
              />
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
