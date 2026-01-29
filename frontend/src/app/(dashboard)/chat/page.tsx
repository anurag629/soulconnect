'use client'

import { MessageSquare } from 'lucide-react'
import { Card } from '@/components/ui/Card'

export default function ChatPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Card className="p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Messages</h1>
        <p className="text-gray-500 mb-4">Coming Soon</p>
        <p className="text-sm text-gray-400">
          Chat with your matches here.
        </p>
      </Card>
    </div>
  )
}
