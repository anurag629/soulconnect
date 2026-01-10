/**
 * ChatWindow Component
 * Real-time chat interface for matched users
 */

'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Send, Smile, Image as ImageIcon, MoreVertical, Phone, Video, ArrowLeft, Check, CheckCheck } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Loading'
import { useAuthStore } from '@/lib/store'

export interface Message {
  id: string
  sender_id: string
  content: string
  message_type: 'text' | 'image' | 'system'
  is_read: boolean
  created_at: string
}

export interface ChatParticipant {
  id: string
  first_name: string
  last_name: string
  profile_photo: string | null
  is_online?: boolean
}

interface ChatWindowProps {
  conversationId: string
  participant: ChatParticipant
  messages: Message[]
  isLoading?: boolean
  onSendMessage: (content: string) => Promise<void>
  onBack?: () => void
  className?: string
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  participant,
  messages,
  isLoading = false,
  onSendMessage,
  onBack,
  className,
}) => {
  const { user } = useAuthStore()
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      await onSendMessage(newMessage.trim())
      setNewMessage('')
      inputRef.current?.focus()
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Group messages by date
  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = []
    let currentDate = ''

    msgs.forEach((msg) => {
      const msgDate = new Date(msg.created_at).toLocaleDateString()
      if (msgDate !== currentDate) {
        currentDate = msgDate
        groups.push({ date: currentDate, messages: [msg] })
      } else {
        groups[groups.length - 1].messages.push(msg)
      }
    })

    return groups
  }

  const messageGroups = groupMessagesByDate(messages)

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Chat Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
        )}
        <Avatar
          src={participant.profile_photo}
          firstName={participant.first_name}
          lastName={participant.last_name}
          size="md"
          online={participant.is_online}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {participant.first_name} {participant.last_name}
          </h3>
          <p className="text-xs text-gray-500">
            {participant.is_online ? 'Online' : 'Offline'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <Phone className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <Video className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 bg-gray-50">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size="lg" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Avatar
              src={participant.profile_photo}
              firstName={participant.first_name}
              lastName={participant.last_name}
              size="xl"
            />
            <h3 className="mt-4 font-semibold text-gray-900">
              {participant.first_name} {participant.last_name}
            </h3>
            <p className="mt-2 text-gray-500 text-sm max-w-xs">
              This is the beginning of your conversation. Send a message to get started!
            </p>
          </div>
        ) : (
          messageGroups.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex items-center justify-center mb-4">
                <span className="px-3 py-1 text-xs text-gray-500 bg-white rounded-full shadow-sm">
                  {new Date(group.date).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>

              {/* Messages */}
              <div className="space-y-3">
                {group.messages.map((message) => {
                  const isOwn = message.sender_id === user?.id
                  const isSystem = message.message_type === 'system'

                  if (isSystem) {
                    return (
                      <div key={message.id} className="flex justify-center">
                        <span className="px-3 py-1.5 text-xs text-gray-500 bg-gray-100 rounded-full">
                          {message.content}
                        </span>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        'flex',
                        isOwn ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm',
                          isOwn
                            ? 'bg-primary-600 text-white rounded-br-md'
                            : 'bg-white text-gray-900 rounded-bl-md'
                        )}
                      >
                        {message.message_type === 'image' ? (
                          <div className="relative w-48 h-48 rounded-lg overflow-hidden">
                            <Image
                              src={message.content}
                              alt="Shared image"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        )}
                        <div
                          className={cn(
                            'flex items-center justify-end gap-1 mt-1',
                            isOwn ? 'text-white/70' : 'text-gray-400'
                          )}
                        >
                          <span className="text-xs">
                            {new Date(message.created_at).toLocaleTimeString(
                              'en-IN',
                              { hour: '2-digit', minute: '2-digit' }
                            )}
                          </span>
                          {isOwn && (
                            message.is_read ? (
                              <CheckCheck className="h-3.5 w-3.5" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <ImageIcon className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <Smile className="h-5 w-5" />
          </button>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            className="rounded-full !p-3"
            isLoading={isSending}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Chat List Item
interface ChatListItemProps {
  conversation: {
    id: string
    participant: ChatParticipant
    last_message: Message | null
    unread_count: number
  }
  isActive?: boolean
  onClick: () => void
}

const ChatListItem: React.FC<ChatListItemProps> = ({
  conversation,
  isActive = false,
  onClick,
}) => {
  const { participant, last_message, unread_count } = conversation

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left',
        isActive ? 'bg-primary-50' : 'hover:bg-gray-50'
      )}
    >
      <Avatar
        src={participant.profile_photo}
        firstName={participant.first_name}
        lastName={participant.last_name}
        size="md"
        online={participant.is_online}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900 truncate">
            {participant.first_name} {participant.last_name}
          </h4>
          {last_message && (
            <span className="text-xs text-gray-500">
              {formatRelativeTime(last_message.created_at)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 truncate">
            {last_message?.content || 'No messages yet'}
          </p>
          {unread_count > 0 && (
            <span className="flex-shrink-0 ml-2 bg-primary-600 text-white text-xs font-medium rounded-full h-5 min-w-[20px] flex items-center justify-center px-1.5">
              {unread_count > 99 ? '99+' : unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

export { ChatWindow, ChatListItem }
