'use client'

import { Crown, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function SubscriptionPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card className="p-8 text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Crown className="h-8 w-8 text-primary-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h1>

        <p className="text-gray-600 mb-6">
          Premium subscriptions are coming soon! Get ready to unlock exclusive features
          and find your perfect match faster.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-primary-500" />
            Upcoming Premium Features
          </h3>
          <ul className="text-sm text-gray-600 space-y-2 text-left max-w-xs mx-auto">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
              Unlimited profile views
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
              See who liked your profile
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
              Priority in search results
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
              Advanced filters
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
              Direct messaging
            </li>
          </ul>
        </div>

        <Button variant="outline" disabled>
          Notify Me When Available
        </Button>

        <p className="text-xs text-gray-500 mt-4">
          We'll let you know as soon as premium plans are available
        </p>
      </Card>
    </div>
  )
}
