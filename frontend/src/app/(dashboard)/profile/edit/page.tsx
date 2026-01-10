/**
 * Profile Edit Page
 * Form for editing user profile details with simple tab navigation
 */

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Save, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Loading'
import { useProfileStore } from '@/lib/store'
import { profileAPI } from '@/lib/api'
import { cn } from '@/lib/utils'

// Profile form schema - matches backend ProfileUpdateSerializer fields
const profileSchema = z.object({
  about_me: z.string().max(2000).optional(),
  full_name: z.string().optional(),
  height_cm: z.number().min(100).max(250).optional().nullable(),
  body_type: z.string().optional(),
  complexion: z.string().optional(),
  marital_status: z.string().optional(),
  religion: z.string().optional(),
  caste: z.string().optional(),
  sub_caste: z.string().optional(),
  mother_tongue: z.string().optional(),
  manglik: z.boolean().optional(),
  star_sign: z.string().optional(),
  birth_time: z.string().optional(),
  birth_place: z.string().optional(),
  education: z.string().optional(),
  education_detail: z.string().optional(),
  profession: z.string().optional(),
  annual_income: z.string().optional(),
  company_name: z.string().optional(),
  family_type: z.string().optional(),
  family_values: z.string().optional(),
  father_occupation: z.string().optional(),
  mother_occupation: z.string().optional(),
  siblings: z.number().min(0).max(20).optional().nullable(),
  diet: z.string().optional(),
  smoking: z.string().optional(),
  drinking: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

// Options for various fields
const BODY_TYPES = ['Slim', 'Average', 'Athletic', 'Heavy']
const COMPLEXIONS = ['Very Fair', 'Fair', 'Wheatish', 'Dark']
const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other']
const EDUCATION_LEVELS = ['High School', 'Diploma', 'Bachelors', 'Masters', 'Doctorate', 'Professional Degree']
const OCCUPATIONS = ['Software Professional', 'Doctor', 'Engineer', 'Teacher', 'Business', 'Government', 'Private Job', 'Self Employed', 'Other']
const INCOME_RANGES = ['Below 3 Lakh', '3-5 Lakh', '5-7 Lakh', '7-10 Lakh', '10-15 Lakh', '15-25 Lakh', '25-50 Lakh', '50 Lakh - 1 Crore', 'Above 1 Crore']
const FAMILY_TYPES = ['Joint', 'Nuclear', 'Extended']
const FAMILY_VALUES = ['Orthodox', 'Traditional', 'Moderate', 'Liberal']
const DIET_OPTIONS = ['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan']
const YES_NO_OCCASIONALLY = ['Yes', 'No', 'Occasionally']
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi NCR',
]
const MOTHER_TONGUES = ['Hindi', 'English', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Odia', 'Urdu']

const TABS = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'religious', label: 'Religious' },
  { id: 'education', label: 'Education' },
  { id: 'family', label: 'Family' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'location', label: 'Location' },
]

export default function ProfileEditPage() {
  const router = useRouter()
  const { profile, fetchProfile } = useProfileStore()
  const [activeTab, setActiveTab] = useState('basic')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true)
      try {
        await fetchProfile()
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadProfile()
  }, [fetchProfile])

  useEffect(() => {
    if (profile) {
      reset({
        about_me: profile.about_me || '',
        full_name: profile.full_name || '',
        height_cm: profile.height_cm || null,
        body_type: profile.body_type || '',
        complexion: profile.complexion || '',
        marital_status: profile.marital_status || '',
        religion: profile.religion || '',
        caste: profile.caste || '',
        sub_caste: profile.sub_caste || '',
        mother_tongue: profile.mother_tongue || '',
        manglik: profile.manglik || false,
        star_sign: profile.star_sign || '',
        birth_time: '',
        birth_place: '',
        education: profile.education || '',
        education_detail: profile.education_detail || '',
        profession: profile.profession || '',
        annual_income: profile.annual_income || '',
        company_name: profile.company_name || '',
        family_type: profile.family_type || '',
        family_values: profile.family_values || '',
        father_occupation: profile.father_occupation || '',
        mother_occupation: profile.mother_occupation || '',
        siblings: profile.siblings || null,
        diet: profile.diet || '',
        smoking: profile.smoking || '',
        drinking: profile.drinking || '',
        country: profile.country || 'India',
        state: profile.state || '',
        city: profile.city || '',
        pincode: '',
      })
    }
  }, [profile, reset])

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true)
    try {
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== null && v !== undefined && v !== '')
      )
      await profileAPI.updateProfile(cleanData)
      await fetchProfile()
      toast.success('Profile updated successfully!')
      router.push('/profile')
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      toast.error(error.response?.data?.detail || 'Failed to update profile')
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/profile">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        </div>
        <Button onClick={handleSubmit(onSubmit)} disabled={isSaving || !isDirty}>
          {isSaving ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
          ) : (
            <><Save className="h-4 w-4 mr-2" />Save Changes</>
          )}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-all',
              activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {activeTab === 'basic' && (
          <Card>
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">About Me</label>
                <textarea {...register('about_me')} rows={5} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Write something about yourself..." />
                <p className="text-sm text-gray-500 mt-1">{watch('about_me')?.length || 0}/2000 characters</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Full Name" {...register('full_name')} placeholder="e.g., John Doe" />
                <Input label="Height (cm)" type="number" {...register('height_cm', { valueAsNumber: true })} placeholder="e.g., 170" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select label="Body Type" options={BODY_TYPES.map(t => ({ value: t.toLowerCase(), label: t }))} {...register('body_type')} />
                <Select label="Complexion" options={COMPLEXIONS.map(c => ({ value: c.toLowerCase().replace(' ', '_'), label: c }))} {...register('complexion')} />
              </div>
              <Select label="Marital Status" options={[
                { value: 'never_married', label: 'Never Married' },
                { value: 'divorced', label: 'Divorced' },
                { value: 'widowed', label: 'Widowed' },
                { value: 'awaiting_divorce', label: 'Awaiting Divorce' }
              ]} {...register('marital_status')} />
            </CardContent>
          </Card>
        )}

        {activeTab === 'religious' && (
          <Card>
            <CardHeader><CardTitle>Religious & Community</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select label="Religion" options={RELIGIONS.map(r => ({ value: r.toLowerCase(), label: r }))} {...register('religion')} />
                <Select label="Mother Tongue" options={MOTHER_TONGUES.map(l => ({ value: l.toLowerCase(), label: l }))} {...register('mother_tongue')} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Caste" {...register('caste')} placeholder="Enter your caste" />
                <Input label="Sub Caste" {...register('sub_caste')} placeholder="Enter your sub-caste" />
              </div>
              <Select label="Star Sign" options={[
                { value: 'aries', label: 'Aries' },
                { value: 'taurus', label: 'Taurus' },
                { value: 'gemini', label: 'Gemini' },
                { value: 'cancer', label: 'Cancer' },
                { value: 'leo', label: 'Leo' },
                { value: 'virgo', label: 'Virgo' },
                { value: 'libra', label: 'Libra' },
                { value: 'scorpio', label: 'Scorpio' },
                { value: 'sagittarius', label: 'Sagittarius' },
                { value: 'capricorn', label: 'Capricorn' },
                { value: 'aquarius', label: 'Aquarius' },
                { value: 'pisces', label: 'Pisces' }
              ]} {...register('star_sign')} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Birth Time" type="time" {...register('birth_time')} />
                <Input label="Birth Place" {...register('birth_place')} placeholder="Enter birth place" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register('manglik')} className="w-5 h-5 text-primary-600 rounded" />
                <span>I am Manglik</span>
              </label>
            </CardContent>
          </Card>
        )}

        {activeTab === 'education' && (
          <Card>
            <CardHeader><CardTitle>Education & Career</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select label="Highest Education" options={EDUCATION_LEVELS.map(e => ({ value: e.toLowerCase().replace(/ /g, '_'), label: e }))} {...register('education')} />
                <Input label="Education Details" {...register('education_detail')} placeholder="e.g., B.Tech from IIT Delhi" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select label="Profession" options={OCCUPATIONS.map(o => ({ value: o.toLowerCase().replace(/ /g, '_'), label: o }))} {...register('profession')} />
                <Input label="Company" {...register('company_name')} placeholder="e.g., Google India" />
              </div>
              <Select label="Annual Income" options={INCOME_RANGES.map(i => ({ value: i.toLowerCase().replace(/ /g, '_'), label: i }))} {...register('annual_income')} />
            </CardContent>
          </Card>
        )}

        {activeTab === 'family' && (
          <Card>
            <CardHeader><CardTitle>Family Details</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select label="Family Type" options={FAMILY_TYPES.map(t => ({ value: t.toLowerCase(), label: t }))} {...register('family_type')} />
                <Select label="Family Values" options={FAMILY_VALUES.map(v => ({ value: v.toLowerCase(), label: v }))} {...register('family_values')} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Father's Occupation" {...register('father_occupation')} placeholder="e.g., Retired Officer" />
                <Input label="Mother's Occupation" {...register('mother_occupation')} placeholder="e.g., Homemaker" />
              </div>
              <Input label="Number of Siblings" type="number" {...register('siblings', { valueAsNumber: true })} placeholder="e.g., 2" />
            </CardContent>
          </Card>
        )}

        {activeTab === 'lifestyle' && (
          <Card>
            <CardHeader><CardTitle>Lifestyle</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Select label="Diet" options={DIET_OPTIONS.map(d => ({ value: d.toLowerCase().replace('-', '_'), label: d }))} {...register('diet')} />
                <Select label="Smoking" options={YES_NO_OCCASIONALLY.map(o => ({ value: o.toLowerCase(), label: o }))} {...register('smoking')} />
                <Select label="Drinking" options={YES_NO_OCCASIONALLY.map(o => ({ value: o.toLowerCase(), label: o }))} {...register('drinking')} />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'location' && (
          <Card>
            <CardHeader><CardTitle>Location</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Country" {...register('country')} placeholder="e.g., India" />
                <Select label="State" options={INDIAN_STATES.map(s => ({ value: s.toLowerCase().replace(/ /g, '_'), label: s }))} {...register('state')} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="City" {...register('city')} placeholder="e.g., Mumbai" />
                <Input label="Pincode" {...register('pincode')} placeholder="e.g., 400001" />
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  )
}
