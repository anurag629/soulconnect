'use client'

import { Heart } from 'lucide-react'
import { Card } from '@/components/ui/Card'

export default function MatchesPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Card className="p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
          <Heart className="h-8 w-8 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Matches</h1>
        <p className="text-gray-500 mb-4">Coming Soon</p>
        <p className="text-sm text-gray-400">
          View and manage your matches and interests here.
        </p>
      </Card>
    </div>
  )
}
