/**
 * Search Page
 * Browse and search profiles with filters
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, X, ChevronDown, Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProfileCard, ProfileData } from '@/components/ProfileCard'
import { ProfileCardSkeleton } from '@/components/ui/Loading'
import { NoSearchResultsEmpty } from '@/components/ui/EmptyState'
import { profileAPI, matchingAPI } from '@/lib/api'
import { debounce } from '@/lib/utils'
import {
  RELIGIONS,
  EDUCATION_LEVELS,
  MARITAL_STATUS,
  INDIAN_STATES,
  INCOME_RANGES,
} from '@/lib/utils'

interface Filters {
  age_from: string
  age_to: string
  height_from: string
  height_to: string
  religion: string
  education: string
  marital_status: string
  location: string
  annual_income: string
}

const initialFilters: Filters = {
  age_from: '18',
  age_to: '40',
  height_from: '',
  height_to: '',
  religion: '',
  education: '',
  marital_status: '',
  location: '',
  annual_income: '',
}

export default function SearchPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<ProfileData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Fetch profiles with current filters
  const fetchProfiles = useCallback(async (currentFilters: Filters, pageNum: number) => {
    setIsLoading(true)
    try {
      const params: any = { page: pageNum }
      
      if (currentFilters.age_from) params.age_from = parseInt(currentFilters.age_from)
      if (currentFilters.age_to) params.age_to = parseInt(currentFilters.age_to)
      if (currentFilters.religion) params.religion = currentFilters.religion
      if (currentFilters.education) params.education = currentFilters.education
      if (currentFilters.marital_status) params.marital_status = currentFilters.marital_status
      if (currentFilters.location) params.location = currentFilters.location
      if (currentFilters.annual_income) params.annual_income = currentFilters.annual_income

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

  // Debounced search
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
      console.error('Failed to like profile:', error)
    }
  }

  const handlePass = async (profileId: string) => {
    try {
      await matchingAPI.passProfile(profileId)
      setProfiles((prev) => prev.filter((p) => p.id !== profileId))
    } catch (error) {
      console.error('Failed to pass profile:', error)
    }
  }

  const handleViewProfile = (profileId: string) => {
    router.push(`/profile/${profileId}`)
  }

  const activeFiltersCount = Object.values(filters).filter(
    (v, i) => v && v !== initialFilters[Object.keys(initialFilters)[i] as keyof Filters]
  ).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Browse Profiles</h1>
          <p className="text-gray-500 text-sm">Find your perfect match</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<Filter className="h-4 w-4" />}
          >
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="primary" size="sm" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          <div className="hidden sm:flex items-center border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
            >
              <Grid className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
            >
              <List className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Filter Profiles</h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Clear all
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Age Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Age Range
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="From"
                  value={filters.age_from}
                  onChange={(e) => handleFilterChange('age_from', e.target.value)}
                  className="!py-2"
                />
                <span className="text-gray-400">-</span>
                <Input
                  type="number"
                  placeholder="To"
                  value={filters.age_to}
                  onChange={(e) => handleFilterChange('age_to', e.target.value)}
                  className="!py-2"
                />
              </div>
            </div>

            {/* Religion */}
            <Select
              label="Religion"
              placeholder="Any religion"
              value={filters.religion}
              onChange={(e) => handleFilterChange('religion', e.target.value)}
              options={RELIGIONS.map((r) => ({ value: r, label: r }))}
            />

            {/* Education */}
            <Select
              label="Education"
              placeholder="Any education"
              value={filters.education}
              onChange={(e) => handleFilterChange('education', e.target.value)}
              options={EDUCATION_LEVELS.map((e) => ({ value: e, label: e }))}
            />

            {/* Marital Status */}
            <Select
              label="Marital Status"
              placeholder="Any status"
              value={filters.marital_status}
              onChange={(e) => handleFilterChange('marital_status', e.target.value)}
              options={MARITAL_STATUS.map((m) => ({ value: m, label: m }))}
            />

            {/* Location */}
            <Select
              label="Location"
              placeholder="Any location"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
            />

            {/* Income */}
            <Select
              label="Annual Income"
              placeholder="Any income"
              value={filters.annual_income}
              onChange={(e) => handleFilterChange('annual_income', e.target.value)}
              options={INCOME_RANGES}
            />
          </div>
        </Card>
      )}

      {/* Active Filters Tags */}
      {activeFiltersCount > 0 && !showFilters && (
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.religion && (
            <Badge variant="outline" className="gap-1">
              {filters.religion}
              <button onClick={() => handleFilterChange('religion', '')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.education && (
            <Badge variant="outline" className="gap-1">
              {filters.education}
              <button onClick={() => handleFilterChange('education', '')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.location && (
            <Badge variant="outline" className="gap-1">
              {filters.location}
              <button onClick={() => handleFilterChange('location', '')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <button
            onClick={clearFilters}
            className="text-sm text-primary-600 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Results */}
      {isLoading && page === 1 ? (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : ''}`}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ProfileCardSkeleton key={i} />
          ))}
        </div>
      ) : profiles.length > 0 ? (
        <>
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : ''}`}>
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                variant={viewMode === 'list' ? 'compact' : 'default'}
                onLike={handleLike}
                onPass={handlePass}
                onViewProfile={handleViewProfile}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center mt-8">
              <Button
                variant="outline"
                onClick={loadMore}
                isLoading={isLoading}
              >
                Load More Profiles
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
