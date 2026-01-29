'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Save, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Loading'
import { profileAPI } from '@/lib/api'
import { RELIGIONS, MARITAL_STATUS, INDIAN_STATES } from '@/lib/utils'

// Backend-aligned education options
const EDUCATION_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'high_school', label: 'High School' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'bachelors', label: "Bachelor's Degree" },
  { value: 'masters', label: "Master's Degree" },
  { value: 'doctorate', label: 'Doctorate/PhD' },
  { value: 'professional', label: 'Professional Degree' },
]

interface PreferenceFormData {
  age_from: number
  age_to: number
  religion: string
  marital_status: string
  education: string
  state: string
  diet: string
}

export default function PartnerPreferencesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<PreferenceFormData>({
    defaultValues: {
      age_from: 21,
      age_to: 35,
      religion: '',
      marital_status: '',
      education: '',
      state: '',
      diet: '',
    },
  })

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const response = await profileAPI.getPartnerPreferences()
        const data = response.data
        reset({
          age_from: data.age_from || 21,
          age_to: data.age_to || 35,
          religion: Array.isArray(data.religion) ? data.religion[0] || '' : data.religion || '',
          marital_status: Array.isArray(data.marital_status) ? data.marital_status[0] || '' : data.marital_status || '',
          education: Array.isArray(data.education) ? data.education[0] || '' : data.education || '',
          state: Array.isArray(data.state) ? data.state[0] || '' : data.state || '',
          diet: Array.isArray(data.diet) ? data.diet[0] || '' : data.diet || '',
        })
      } catch (error) {
        console.error('Failed to load preferences:', error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [reset])

  const onSubmit = async (data: PreferenceFormData) => {
    setIsSaving(true)
    try {
      // Convert single values to arrays for backend
      const payload = {
        age_from: data.age_from,
        age_to: data.age_to,
        religion: data.religion ? [data.religion] : [],
        marital_status: data.marital_status ? [data.marital_status] : [],
        education: data.education ? [data.education] : [],
        state: data.state ? [data.state] : [],
        diet: data.diet ? [data.diet] : [],
      }
      await profileAPI.updatePartnerPreferences(payload)
      toast.success('Preferences saved!')
      router.push('/profile')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href="/profile">
            <Button variant="outline" size="sm"><ChevronLeft className="h-4 w-4" /></Button>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Partner Preferences</h1>
        </div>
        <Button size="sm" onClick={handleSubmit(onSubmit)} disabled={isSaving || !isDirty}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        </Button>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Set your preferences to get better match recommendations
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="p-5 space-y-4">
            {/* Age Range */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Age Range</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  {...register('age_from', { valueAsNumber: true })}
                  className="!py-2"
                />
                <span className="text-gray-400">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  {...register('age_to', { valueAsNumber: true })}
                  className="!py-2"
                />
              </div>
            </div>

            <Select
              label="Religion"
              options={[{ value: '', label: 'Any' }, ...RELIGIONS.map(r => ({ value: r.toLowerCase(), label: r }))]}
              {...register('religion')}
            />

            <Select
              label="Marital Status"
              options={[{ value: '', label: 'Any' }, ...MARITAL_STATUS.map(m => ({ value: m.toLowerCase().replace(/ /g, '_'), label: m }))]}
              {...register('marital_status')}
            />

            <Select
              label="Education"
              options={EDUCATION_OPTIONS}
              {...register('education')}
            />

            <Select
              label="Location (State)"
              options={[{ value: '', label: 'Any' }, ...INDIAN_STATES.map(s => ({ value: s, label: s }))]}
              {...register('state')}
            />

            <Select
              label="Diet"
              options={[
                { value: '', label: 'Any' },
                { value: 'vegetarian', label: 'Vegetarian' },
                { value: 'non_vegetarian', label: 'Non-Vegetarian' },
                { value: 'eggetarian', label: 'Eggetarian' },
              ]}
              {...register('diet')}
            />
          </CardContent>
        </Card>

        <Button type="submit" className="w-full mt-4" isLoading={isSaving}>
          Save Preferences
        </Button>
      </form>
    </div>
  )
}
