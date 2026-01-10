/**
 * Partner Preferences Page
 * Set desired partner preferences for matching
 */

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Save, Loader2, Heart, Filter } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Loading'
import { profileAPI } from '@/lib/api'

// Backend-aligned form data interface
interface PreferenceFormData {
  age_from: number
  age_to: number
  height_from: number
  height_to: number
  marital_status: string[]
  religion: string[]
  caste: string[]
  caste_no_bar: boolean
  education: string[]
  profession: string[]
  income_from: string
  income_to: string
  country: string[]
  state: string[]
  mother_tongue: string[]
  diet: string[]
  smoking: string[]
  drinking: string[]
  manglik: string[]
  additional_preferences: string
}

// Options
const MARITAL_STATUS_OPTIONS = ['Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce']
const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other']
const MOTHER_TONGUES = [
  'Hindi', 'English', 'Bengali', 'Telugu', 'Marathi', 'Tamil',
  'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Odia', 'Urdu',
]
const EDUCATION_LEVELS = [
  'High School', 'Diploma', 'Bachelor\'s', 'Master\'s', 'Doctorate', 'Professional Degree',
]
const OCCUPATIONS = [
  'Software Professional', 'Doctor', 'Engineer', 'Teacher', 'Business',
  'Government', 'Private Job', 'Self Employed', 'Other',
]
const INCOME_RANGES = [
  'Below 3 Lakh', '3-5 Lakh', '5-7 Lakh', '7-10 Lakh', '10-15 Lakh',
  '15-25 Lakh', '25-50 Lakh', '50 Lakh - 1 Crore', 'Above 1 Crore',
]
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi NCR',
]
const DIET_OPTIONS = ['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan']
const YES_NO_DOESNT_MATTER = ['Yes', 'No', 'Doesn\'t Matter']
const MANGLIK_OPTIONS = ['Manglik', 'Non-Manglik', 'Doesn\'t Matter']

export default function PartnerPreferencesPage() {
  const router = useRouter()
  const [preferences, setPreferences] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<PreferenceFormData>({
    defaultValues: {
      age_from: 21,
      age_to: 35,
      height_from: 150,
      height_to: 190,
      marital_status: [],
      religion: [],
      caste: [],
      caste_no_bar: false,
      education: [],
      profession: [],
      income_from: '',
      income_to: '',
      country: ['India'],
      state: [],
      mother_tongue: [],
      diet: [],
      smoking: [],
      drinking: [],
      manglik: [],
      additional_preferences: '',
    },
  })

  useEffect(() => {
    const loadPreferences = async () => {
      setIsLoading(true)
      try {
        const response = await profileAPI.getPartnerPreferences()
        setPreferences(response.data)
        if (response.data) {
          reset({
            age_from: response.data.age_from || 21,
            age_to: response.data.age_to || 35,
            height_from: response.data.height_from || 150,
            height_to: response.data.height_to || 190,
            marital_status: response.data.marital_status || [],
            religion: response.data.religion || [],
            caste: response.data.caste || [],
            caste_no_bar: response.data.caste_no_bar || false,
            education: response.data.education || [],
            profession: response.data.profession || [],
            income_from: response.data.income_from || '',
            income_to: response.data.income_to || '',
            country: response.data.country || ['India'],
            state: response.data.state || [],
            mother_tongue: response.data.mother_tongue || [],
            diet: response.data.diet || [],
            smoking: response.data.smoking || [],
            drinking: response.data.drinking || [],
            manglik: response.data.manglik || [],
            additional_preferences: response.data.additional_preferences || '',
          })
        }
      } catch (error) {
        console.error('Failed to fetch preferences:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadPreferences()
  }, [reset])

  const onSubmit = async (data: PreferenceFormData) => {
    setIsSaving(true)
    try {
      await profileAPI.updatePartnerPreferences(data)
      toast.success('Partner preferences saved!')
      router.push('/profile')
    } catch (error: any) {
      console.error('Failed to update preferences:', error)
      toast.error(error.response?.data?.detail || 'Failed to save preferences')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/profile">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Partner Preferences</h1>
            <p className="text-gray-500 text-sm">Set your ideal partner preferences for better matches</p>
          </div>
        </div>
        <Button onClick={handleSubmit(onSubmit)} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Age & Height */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary-500" />
              Basic Criteria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input
                label="Age From"
                type="number"
                {...register('age_from', { valueAsNumber: true })}
                min={18}
                max={70}
              />
              <Input
                label="Age To"
                type="number"
                {...register('age_to', { valueAsNumber: true })}
                min={18}
                max={70}
              />
              <Input
                label="Height From (cm)"
                type="number"
                {...register('height_from', { valueAsNumber: true })}
                min={100}
                max={250}
              />
              <Input
                label="Height To (cm)"
                type="number"
                {...register('height_to', { valueAsNumber: true })}
                min={100}
                max={250}
              />
            </div>

            {/* Marital Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marital Status (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {MARITAL_STATUS_OPTIONS.map((status) => (
                  <label
                    key={status}
                    className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      value={status.toLowerCase().replace(' ', '_')}
                      {...register('marital_status')}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm">{status}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Religion & Community */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary-500" />
              Religion & Community
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Religion (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {RELIGIONS.map((religion) => (
                  <label
                    key={religion}
                    className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      value={religion.toLowerCase()}
                      {...register('religion')}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm">{religion}</span>
                  </label>
                ))}
              </div>
            </div>

            <Input
              label="Castes (comma-separated)"
              {...register('caste')}
              placeholder="e.g., Brahmin, Rajput, Agarwal"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mother Tongue (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {MOTHER_TONGUES.map((lang) => (
                  <label
                    key={lang}
                    className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      value={lang.toLowerCase()}
                      {...register('mother_tongue')}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm">{lang}</span>
                  </label>
                ))}
              </div>
            </div>

            <Select
              label="Manglik Preference"
              {...register('manglik')}
              options={MANGLIK_OPTIONS.map((opt) => ({
                value: opt.toLowerCase().replace(' ', '_').replace("'", ''),
                label: opt,
              }))}
              placeholder="Select manglik preference"
            />
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred States (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                {INDIAN_STATES.map((st) => (
                  <label
                    key={st}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                  >
                    <input
                      type="checkbox"
                      value={st.toLowerCase().replace(' ', '_')}
                      {...register('state')}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm">{st}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Education & Career */}
        <Card>
          <CardHeader>
            <CardTitle>Education & Career</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Education Level (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {EDUCATION_LEVELS.map((edu) => (
                  <label
                    key={edu}
                    className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      value={edu.toLowerCase().replace(/'/g, '').replace(' ', '_')}
                      {...register('education')}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm">{edu}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Occupation (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {OCCUPATIONS.map((occ) => (
                  <label
                    key={occ}
                    className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      value={occ.toLowerCase().replace(' ', '_')}
                      {...register('profession')}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm">{occ}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Minimum Annual Income"
                {...register('income_from')}
                options={[
                  { value: '', label: 'Any' },
                  ...INCOME_RANGES.map((inc) => ({
                    value: inc.toLowerCase().replace(/ /g, '_'),
                    label: inc,
                  })),
                ]}
                placeholder="Select minimum income"
              />
              <Select
                label="Maximum Annual Income"
                {...register('income_to')}
                options={[
                  { value: '', label: 'Any' },
                  ...INCOME_RANGES.map((inc) => ({
                    value: inc.toLowerCase().replace(/ /g, '_'),
                    label: inc,
                  })),
                ]}
                placeholder="Select maximum income"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lifestyle */}
        <Card>
          <CardHeader>
            <CardTitle>Lifestyle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diet Preference (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {DIET_OPTIONS.map((diet) => (
                  <label
                    key={diet}
                    className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      value={diet.toLowerCase().replace('-', '_')}
                      {...register('diet')}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm">{diet}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Smoking Preference
                </label>
                <div className="flex flex-wrap gap-2">
                  {YES_NO_DOESNT_MATTER.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        value={opt.toLowerCase().replace(' ', '_').replace("'", '')}
                        {...register('smoking')}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Drinking Preference
                </label>
                <div className="flex flex-wrap gap-2">
                  {YES_NO_DOESNT_MATTER.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        value={opt.toLowerCase().replace(' ', '_').replace("'", '')}
                        {...register('drinking')}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button (Mobile) */}
        <div className="md:hidden">
          <Button
            type="submit"
            className="w-full"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
