/**
 * Subscription Page
 * View and manage subscription plans
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Check, Crown, Sparkles, Star, CreditCard } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ConfirmModal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Loading'
import { paymentAPI } from '@/lib/api'
import { useAuthStore, useSubscriptionStore, SubscriptionPlan } from '@/lib/store'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function SubscriptionPage() {
  const { user } = useAuthStore()
  const { subscription, plans, fetchSubscription, fetchPlans } = useSubscriptionStore()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([fetchSubscription(), fetchPlans()])
      } catch (error) {
        console.error('Failed to load subscription data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [fetchSubscription, fetchPlans])

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    toast('Payment integration coming soon!', {
      icon: '🚀',
      duration: 3000,
    })
  }

  const handleCancelSubscription = async () => {
    try {
      await paymentAPI.cancelSubscription()
      await fetchSubscription()
      toast.success('Subscription cancelled successfully')
      setShowCancelModal(false)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to cancel subscription')
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 font-serif mb-3">
          Choose Your Plan
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Upgrade to unlock premium features and find your perfect match faster
        </p>
      </div>

      {/* Current Subscription */}
      {subscription && subscription.status === 'active' && (
        <Card className="mb-8 p-6 bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <Crown className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{subscription.plan.name}</h3>
                  <Badge variant="success">Active</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Valid until {formatDate(subscription.end_date)}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(true)}
            >
              Cancel Subscription
            </Button>
          </div>
        </Card>
      )}

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {(Array.isArray(plans) ? plans : []).map((plan) => {
          const isCurrentPlan = subscription?.plan?.id === plan.id && subscription.status === 'active'
          const isPopular = plan.is_popular

          return (
            <div
              key={plan.id}
              className={cn(
                'rounded-2xl overflow-hidden',
                isPopular ? 'ring-2 ring-primary-500 shadow-xl' : 'border border-gray-200 shadow-lg'
              )}
            >
              {/* Popular Header Banner */}
              {isPopular && (
                <div className="bg-primary-500 text-white py-2 px-4 text-center">
                  <div className="flex items-center justify-center gap-1 font-semibold text-sm">
                    <Sparkles className="h-4 w-4" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className={cn(
                'bg-white p-6',
                isCurrentPlan && 'bg-gray-50'
              )}>
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-gray-500">
                      /{plan.duration_days >= 365 ? 'forever' : plan.duration_days >= 30 ? `${Math.round(plan.duration_days / 30)} month${Math.round(plan.duration_days / 30) > 1 ? 's' : ''}` : `${plan.duration_days} days`}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isPopular ? 'primary' : 'outline'}
                  className="w-full"
                  onClick={() => handleSubscribe(plan)}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? 'Current Plan' : plan.price === 0 ? 'Current Plan' : 'Coming Soon'}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Trust Indicators */}
      <div className="grid sm:grid-cols-3 gap-6 text-center">
        <div>
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h4 className="font-semibold text-gray-900">Secure Payments</h4>
          <p className="text-sm text-gray-500">Coming soon</p>
        </div>
        <div>
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-900">Cancel Anytime</h4>
          <p className="text-sm text-gray-500">No questions asked</p>
        </div>
        <div>
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-3">
            <Star className="h-6 w-6 text-primary-600" />
          </div>
          <h4 className="font-semibold text-gray-900">Money Back Guarantee</h4>
          <p className="text-sm text-gray-500">7-day refund policy</p>
        </div>
      </div>

      {/* Cancel Subscription Modal */}
      <ConfirmModal
        open={showCancelModal}
        onOpenChange={setShowCancelModal}
        title="Cancel Subscription"
        description="Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period."
        confirmText="Yes, Cancel"
        variant="danger"
        onConfirm={handleCancelSubscription}
      />
    </div>
  )
}
