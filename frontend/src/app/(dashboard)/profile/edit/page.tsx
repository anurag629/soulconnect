'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Loader2, CheckCircle, Clock, XCircle, CreditCard, Copy, Check } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Loading'
import { useProfileStore } from '@/lib/store'
import { profileAPI } from '@/lib/api'
import { cn, RELIGIONS, INDIAN_STATES } from '@/lib/utils'

// Backend-aligned constants
const GENDER_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
]

const EDUCATION_OPTIONS = [
  { value: 'high_school', label: 'High School' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'bachelors', label: "Bachelor's Degree" },
  { value: 'masters', label: "Master's Degree" },
  { value: 'doctorate', label: 'Doctorate/PhD' },
  { value: 'professional', label: 'Professional Degree' },
]

const INCOME_OPTIONS = [
  { value: '0-3', label: 'Below 3 Lakh' },
  { value: '3-5', label: '3-5 Lakh' },
  { value: '5-10', label: '5-10 Lakh' },
  { value: '10-15', label: '10-15 Lakh' },
  { value: '15-25', label: '15-25 Lakh' },
  { value: '25-50', label: '25-50 Lakh' },
  { value: '50-75', label: '50-75 Lakh' },
  { value: '75-100', label: '75 Lakh - 1 Crore' },
  { value: '100+', label: 'Above 1 Crore' },
]

const MARITAL_STATUS_OPTIONS = [
  { value: 'never_married', label: 'Never Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'awaiting_divorce', label: 'Awaiting Divorce' },
]

const DIET_OPTIONS = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'non_vegetarian', label: 'Non-Vegetarian' },
  { value: 'eggetarian', label: 'Eggetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'jain', label: 'Jain' },
]

const YES_NO_OPTIONS = [
  { value: 'no', label: 'No' },
  { value: 'occasionally', label: 'Occasionally' },
  { value: 'yes', label: 'Yes' },
]

const MANGLIK_OPTIONS = [
  { value: 'no', label: 'No' },
  { value: 'yes', label: 'Yes' },
  { value: 'partial', label: 'Partial' },
  { value: 'dont_know', label: "Don't Know" },
]

const FAMILY_TYPE_OPTIONS = [
  { value: 'joint', label: 'Joint Family' },
  { value: 'nuclear', label: 'Nuclear Family' },
]

const FAMILY_VALUES_OPTIONS = [
  { value: 'traditional', label: 'Traditional' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'liberal', label: 'Liberal' },
]

const STAR_SIGN_OPTIONS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
].map(s => ({ value: s.toLowerCase(), label: s }))

const TABS = [
  { id: 'basic', label: 'Basic' },
  { id: 'background', label: 'Background' },
  { id: 'family', label: 'Family' },
  { id: 'location', label: 'Location' },
  { id: 'payment', label: 'Payment' },
]

// Payment status type
interface PaymentStatus {
  has_payment: boolean
  payment: {
    id: string
    amount: string
    transaction_id: string
    status: 'pending' | 'verified' | 'rejected'
    rejection_reason?: string
    submitted_at: string
    verified_at?: string
  } | null
  is_profile_complete: boolean
  is_profile_approved: boolean
}

export default function ProfileEditPage() {
  const router = useRouter()
  const { profile, fetchProfile } = useProfileStore()
  const [activeTab, setActiveTab] = useState('basic')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // Payment state
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [isLoadingPayment, setIsLoadingPayment] = useState(false)
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false)
  const [transactionId, setTransactionId] = useState('')
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null)
  const [upiCopied, setUpiCopied] = useState(false)

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm()

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      await fetchProfile()
      setIsLoading(false)
    }
    load()
  }, [fetchProfile])

  useEffect(() => {
    if (profile) {
      reset({
        // Basic Info
        about_me: profile.about_me || '',
        full_name: profile.full_name || '',
        gender: profile.gender || '',
        date_of_birth: profile.date_of_birth || '',
        height_cm: profile.height_cm || '',
        marital_status: profile.marital_status || '',
        // Religious Background
        religion: profile.religion || '',
        caste: profile.caste || '',
        sub_caste: profile.sub_caste || '',
        gotra: profile.gotra || '',
        manglik: profile.manglik || '',
        star_sign: profile.star_sign || '',
        birth_place: profile.birth_place || '',
        birth_time: profile.birth_time || '',
        // Education & Career
        education: profile.education || '',
        education_detail: profile.education_detail || '',
        profession: profile.profession || '',
        company_name: profile.company_name || '',
        annual_income: profile.annual_income || '',
        // Family
        father_name: profile.father_name || '',
        father_occupation: profile.father_occupation || '',
        mother_name: profile.mother_name || '',
        mother_occupation: profile.mother_occupation || '',
        siblings: profile.siblings || '',
        family_type: profile.family_type || '',
        family_values: profile.family_values || '',
        // Lifestyle
        diet: profile.diet || '',
        smoking: profile.smoking || '',
        drinking: profile.drinking || '',
        // Contact
        phone_number: profile.phone_number || '',
        // Present Address
        state: profile.state || '',
        district: profile.district || '',
        city: profile.city || '',
        country: profile.country || 'India',
        pincode: profile.pincode || '',
        // Native Address
        native_state: profile.native_state || '',
        native_district: profile.native_district || '',
        native_area: profile.native_area || '',
      })
    }
  }, [profile, reset])

  // Fetch payment status when payment tab is active
  useEffect(() => {
    if (activeTab === 'payment') {
      fetchPaymentStatus()
    }
  }, [activeTab])

  const fetchPaymentStatus = async () => {
    setIsLoadingPayment(true)
    try {
      const response = await profileAPI.getPaymentStatus()
      setPaymentStatus(response.data)
    } catch (error) {
      console.error('Failed to fetch payment status:', error)
    } finally {
      setIsLoadingPayment(false)
    }
  }

  const handleCopyUPI = async () => {
    const upiId = 'sschauhanetw@okaxis'
    try {
      await navigator.clipboard.writeText(upiId)
      setUpiCopied(true)
      toast.success('UPI ID copied to clipboard!')
      setTimeout(() => setUpiCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy UPI ID')
    }
  }

  const handlePaymentSubmit = async () => {
    if (!transactionId.trim()) {
      toast.error('Please enter the transaction ID / UTR number')
      return
    }

    setIsSubmittingPayment(true)
    try {
      const formData = new FormData()
      formData.append('transaction_id', transactionId.trim())
      if (paymentScreenshot) {
        formData.append('payment_screenshot', paymentScreenshot)
      }

      await profileAPI.submitPayment(formData)
      toast.success('Payment submitted successfully! Verification pending.')
      setTransactionId('')
      setPaymentScreenshot(null)
      await fetchPaymentStatus()
    } catch (error: any) {
      const message = error.response?.data?.transaction_id?.[0] || 
                     error.response?.data?.error || 
                     'Failed to submit payment'
      toast.error(message)
    } finally {
      setIsSubmittingPayment(false)
    }
  }

  const onSubmit = async (data: any) => {
    setIsSaving(true)
    try {
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== '' && v !== null)
      )
      await profileAPI.updateProfile(cleanData)
      await fetchProfile()
      toast.success('Profile updated!')
      router.push('/profile')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update')
    } finally {
      setIsSaving(false)
    }
  }

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Payment Verified'
      case 'pending':
        return 'Verification Pending'
      case 'rejected':
        return 'Payment Rejected'
      default:
        return status
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/profile">
          <Button variant="outline" size="sm"><ChevronLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-lg overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 px-3 py-2 text-sm font-medium rounded-md transition whitespace-nowrap',
              activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600',
              tab.id === 'payment' && 'flex items-center justify-center gap-1'
            )}
          >
            {tab.id === 'payment' && <CreditCard className="h-4 w-4" />}
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <Card>
            <CardHeader><CardTitle className="text-base">Basic Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">About Me</label>
                <textarea
                  {...register('about_me')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Write about yourself..."
                />
              </div>
              <Input label="Full Name" {...register('full_name')} />
              <div className="grid grid-cols-2 gap-3">
                <Select label="Gender" options={GENDER_OPTIONS} {...register('gender')} />
                <Input label="Date of Birth" type="date" {...register('date_of_birth')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Height (cm)" type="number" {...register('height_cm')} />
                <Select label="Marital Status" options={MARITAL_STATUS_OPTIONS} {...register('marital_status')} />
              </div>

              <Input label="Phone Number" type="tel" {...register('phone_number')} />

              {/* Lifestyle in Basic tab */}
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Lifestyle</h4>
                <div className="grid grid-cols-3 gap-3">
                  <Select label="Diet" options={DIET_OPTIONS} {...register('diet')} />
                  <Select label="Smoking" options={YES_NO_OPTIONS} {...register('smoking')} />
                  <Select label="Drinking" options={YES_NO_OPTIONS} {...register('drinking')} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Background Tab */}
        {activeTab === 'background' && (
          <Card>
            <CardHeader><CardTitle className="text-base">Religious & Education Background</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* Religious */}
              <Select
                label="Religion"
                options={RELIGIONS.map(r => ({ value: r.toLowerCase(), label: r }))}
                {...register('religion')}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Caste" {...register('caste')} />
                <Input label="Sub-Caste" {...register('sub_caste')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Gotra" {...register('gotra')} />
                <Select label="Manglik" options={MANGLIK_OPTIONS} {...register('manglik')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select label="Star Sign (Rashi)" options={STAR_SIGN_OPTIONS} {...register('star_sign')} />
                <Input label="Birth Time" type="time" {...register('birth_time')} />
              </div>
              <Input label="Birth Place" placeholder="e.g., Mumbai, Maharashtra" {...register('birth_place')} />

              {/* Education & Career */}
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Education & Career</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Select label="Education" options={EDUCATION_OPTIONS} {...register('education')} />
                    <Input label="Degree/College" placeholder="e.g., B.Tech from IIT" {...register('education_detail')} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Profession" {...register('profession')} />
                    <Input label="Company" {...register('company_name')} />
                  </div>
                  <Select label="Annual Income" options={INCOME_OPTIONS} {...register('annual_income')} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Family Tab */}
        {activeTab === 'family' && (
          <Card>
            <CardHeader><CardTitle className="text-base">Family Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Father's Name" {...register('father_name')} />
                <Input label="Father's Occupation" {...register('father_occupation')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Mother's Name" {...register('mother_name')} />
                <Input label="Mother's Occupation" {...register('mother_occupation')} />
              </div>
              <Input
                label="Siblings"
                placeholder="e.g., 1 elder brother, 1 younger sister"
                {...register('siblings')}
              />
              <div className="grid grid-cols-2 gap-3">
                <Select label="Family Type" options={FAMILY_TYPE_OPTIONS} {...register('family_type')} />
                <Select label="Family Values" options={FAMILY_VALUES_OPTIONS} {...register('family_values')} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Location Tab */}
        {activeTab === 'location' && (
          <Card>
            <CardHeader><CardTitle className="text-base">Address Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* Present Address */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Present Address</h4>
                <div className="space-y-3">
                  <Select
                    label="State"
                    options={INDIAN_STATES.map(s => ({ value: s, label: s }))}
                    {...register('state')}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="District" {...register('district')} />
                    <Input label="City/Area" {...register('city')} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Country" {...register('country')} defaultValue="India" />
                    <Input label="Pincode" {...register('pincode')} />
                  </div>
                </div>
              </div>

              {/* Native Address */}
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Native Address</h4>
                <div className="space-y-3">
                  <Select
                    label="State"
                    options={INDIAN_STATES.map(s => ({ value: s, label: s }))}
                    {...register('native_state')}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="District" {...register('native_district')} />
                    <Input label="Area/Village" {...register('native_area')} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Tab */}
        {activeTab === 'payment' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Profile Registration Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingPayment ? (
                <div className="flex justify-center py-8">
                  <Spinner size="lg" />
                </div>
              ) : (
                <>
                  {/* Payment Status */}
                  {paymentStatus?.has_payment && paymentStatus.payment && (
                    <div className={cn(
                      'p-4 rounded-lg border',
                      paymentStatus.payment.status === 'verified' && 'bg-green-50 border-green-200',
                      paymentStatus.payment.status === 'pending' && 'bg-yellow-50 border-yellow-200',
                      paymentStatus.payment.status === 'rejected' && 'bg-red-50 border-red-200'
                    )}>
                      <div className="flex items-center gap-2 mb-2">
                        {getPaymentStatusIcon(paymentStatus.payment.status)}
                        <span className="font-medium">{getPaymentStatusText(paymentStatus.payment.status)}</span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Transaction ID: <span className="font-mono">{paymentStatus.payment.transaction_id}</span></p>
                        <p>Amount: ₹{paymentStatus.payment.amount}</p>
                        <p>Submitted: {new Date(paymentStatus.payment.submitted_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                        {paymentStatus.payment.status === 'rejected' && paymentStatus.payment.rejection_reason && (
                          <p className="text-red-600 mt-2">Reason: {paymentStatus.payment.rejection_reason}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Show payment form if no verified payment */}
                  {(!paymentStatus?.has_payment || paymentStatus?.payment?.status === 'rejected') && (
                    <>
                      {/* Payment Info */}
                      <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-lg border border-rose-200">
                        <h3 className="font-semibold text-gray-900 mb-2">Registration Fee: ₹1,000</h3>
                        <p className="text-sm text-gray-600">
                          Complete your profile registration by making a payment of ₹1,000. 
                          Your profile will be activated after payment verification.
                        </p>
                      </div>

                      {/* QR Code Section */}
                      <div className="text-center">
                        <h4 className="font-medium text-gray-900 mb-4">Scan QR Code to Pay</h4>
                        <div className="inline-block bg-white p-4 rounded-xl shadow-lg border">
                          {/* QR Code Image */}
                          <div className="relative w-64 h-64 mx-auto bg-white rounded-lg overflow-hidden">
                            <Image
                              src="/images/payment-qr.png.jpeg"
                              alt="Payment QR Code"
                              width={256}
                              height={256}
                              className="object-contain"
                              priority
                              onError={(e) => {
                                // Fallback if image not found
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
                                      <p class="text-gray-500 text-sm">QR Code Image</p>
                                      <p class="text-xs text-gray-400 mt-1">QR code image not found</p>
                                    </div>
                                  `;
                                }
                              }}
                            />
                          </div>
                          
                          {/* UPI Details */}
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm text-gray-600 mb-2">UPI ID:</p>
                            <div className="flex items-center gap-2">
                              <p className="font-mono text-lg font-semibold text-gray-900">sschauhanetw@okaxis</p>
                              <button
                                onClick={handleCopyUPI}
                                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors group"
                                title="Copy UPI ID"
                                type="button"
                              >
                                {upiCopied ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4 text-gray-600 group-hover:text-gray-900" />
                                )}
                              </button>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">Name: Sanjay Singh Chauhan</p>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-4">
                          Scan with any UPI app: Google Pay, PhonePe, Paytm, etc.
                        </p>
                      </div>

                      {/* Transaction ID Input */}
                      <div className="border-t pt-6">
                        <h4 className="font-medium text-gray-900 mb-4">Submit Payment Details</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                              Transaction ID / UTR Number <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value)}
                              placeholder="Enter 12-digit UTR number"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              You can find the UTR number in your payment app transaction history
                            </p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                              Payment Screenshot (Optional)
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setPaymentScreenshot(e.target.files?.[0] || null)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Upload a screenshot of your payment confirmation (helps in faster verification)
                            </p>
                          </div>

                          <Button
                            type="button"
                            onClick={handlePaymentSubmit}
                            className="w-full"
                            disabled={isSubmittingPayment || !transactionId.trim()}
                          >
                            {isSubmittingPayment ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Submitting...
                              </>
                            ) : (
                              'Submit Payment for Verification'
                            )}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Success message for verified payment */}
                  {paymentStatus?.payment?.status === 'verified' && (
                    <div className="text-center py-4">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900">Payment Verified!</h3>
                      <p className="text-gray-600 mt-2">
                        Your profile registration is complete. You can now access all features.
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Save Button at Bottom (not shown for payment tab) */}
        {activeTab !== 'payment' && (
          <Button
            type="submit"
            className="w-full mt-4"
            isLoading={isSaving}
            disabled={!isDirty}
          >
            Save Changes
          </Button>
        )}
      </form>
    </div>
  )
}
