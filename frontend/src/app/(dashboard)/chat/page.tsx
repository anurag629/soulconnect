/**
 * Chat Page
 * Messaging interface for matched users
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { MessageSquare } from 'lucide-react'
import { ChatWindow, ChatListItem, Message, ChatParticipant } from '@/components/ChatWindow'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { ListSkeleton } from '@/components/ui/Loading'
import { NoMessagesEmpty } from '@/components/ui/EmptyState'
import { chatAPI } from '@/lib/api'
import { cn } from '@/lib/utils'

interface ApiConversation {
  id: string
  other_participant: {
    id: string
    user?: {
      first_name: string
      last_name: string
    }
    photos?: Array<{
      image_url: string
      is_primary: boolean
    }>
  }
  last_message: string | null
  last_message_at: string | null
  unread_count: number
}

interface Conversation {
  id: string
  participant: ChatParticipant
  last_message: Message | null
  unread_count: number
}

// Transform API response to frontend format
const transformConversation = (apiConv: ApiConversation): Conversation => {
  const photos = apiConv.other_participant?.photos || []
  const primaryPhoto = photos.find(p => p.is_primary) || photos[0]
  
  return {
    id: apiConv.id,
    participant: {
      id: apiConv.other_participant?.id || '',
      first_name: apiConv.other_participant?.user?.first_name || '',
      last_name: apiConv.other_participant?.user?.last_name || '',
      profile_photo: primaryPhoto?.image_url || null,
      is_online: false,
    },
    last_message: apiConv.last_message ? {
      id: '',
      sender_id: '',
      content: apiConv.last_message,
      message_type: 'text',
      is_read: true,
      created_at: apiConv.last_message_at || '',
    } : null,
    unread_count: apiConv.unread_count || 0,
  }
}

export default function ChatPage() {
  const searchParams = useSearchParams()
  const matchId = searchParams.get('match')
  
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Handle match ID from URL - create/get conversation
  useEffect(() => {
    const initFromMatch = async () => {
      if (!matchId) return
      
      try {
        const response = await chatAPI.getOrCreateConversation(matchId)
        const conversationId = response.data.id
        if (conversationId) {
          setSelectedConversation(conversationId)
        }
      } catch (error) {
        console.error('Failed to create conversation from match:', error)
      }
    }

    initFromMatch()
  }, [matchId])

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      setIsLoadingConversations(true)
      try {
        const response = await chatAPI.getConversations()
        const rawData = response.data.results || response.data || []
        const transformedConversations = rawData.map(transformConversation)
        setConversations(transformedConversations)
        
        // Auto-select first conversation if no match ID and no selection
        if (transformedConversations.length > 0 && !selectedConversation && !matchId) {
          setSelectedConversation(transformedConversations[0].id)
        }
      } catch (error) {
        console.error('Failed to load conversations:', error)
      } finally {
        setIsLoadingConversations(false)
      }
    }

    loadConversations()
  }, [matchId])

  // Load messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation) return

    const loadMessages = async () => {
      setIsLoadingMessages(true)
      try {
        const response = await chatAPI.getMessages(selectedConversation)
        setMessages(response.data.results || response.data)
        
        // Mark as read
        await chatAPI.markAsRead(selectedConversation)
        
        // Update unread count in conversations list
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConversation ? { ...c, unread_count: 0 } : c
          )
        )
      } catch (error) {
        console.error('Failed to load messages:', error)
      } finally {
        setIsLoadingMessages(false)
      }
    }

    loadMessages()
  }, [selectedConversation])

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return

    try {
      const response = await chatAPI.sendMessage(selectedConversation, content)
      const newMessage = response.data

      // Add message to list
      setMessages((prev) => [...prev, newMessage])

      // Update last message in conversations
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation
            ? { ...c, last_message: newMessage }
            : c
        )
      )
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  }

  const selectedConversationData = conversations.find((c) => c.id === selectedConversation)

  const filteredConversations = conversations.filter((c) =>
    `${c.participant.first_name} ${c.participant.last_name}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Conversations List */}
      <div
        className={cn(
          'w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-gray-100 bg-white flex flex-col',
          selectedConversation && 'hidden md:flex'
        )}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="!py-2"
          />
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoadingConversations ? (
            <div className="p-4">
              <ListSkeleton count={5} />
            </div>
          ) : filteredConversations.length > 0 ? (
            <div className="space-y-1">
              {filteredConversations.map((conversation) => (
                <ChatListItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={conversation.id === selectedConversation}
                  onClick={() => setSelectedConversation(conversation.id)}
                />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <NoMessagesEmpty />
          ) : (
            <div className="text-center py-8 text-gray-500">
              No conversations found
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className={cn('flex-1 flex flex-col', !selectedConversation && 'hidden md:flex')}>
        {selectedConversationData ? (
          <ChatWindow
            conversationId={selectedConversation!}
            participant={selectedConversationData.participant}
            messages={messages}
            isLoading={isLoadingMessages}
            onSendMessage={handleSendMessage}
            onBack={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Your Messages
              </h3>
              <p className="text-gray-500 max-w-sm">
                Select a conversation to start chatting with your matches
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
