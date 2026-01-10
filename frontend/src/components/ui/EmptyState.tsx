/**
 * Empty State Component
 * Display when no data is available
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './Button'
import {
  Search,
  Heart,
  MessageSquare,
  Users,
  FileText,
  Bell,
  LucideIcon,
} from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FileText,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="primary">
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Pre-configured empty states for common scenarios

const NoMatchesEmpty: React.FC<{ onExplore?: () => void }> = ({ onExplore }) => (
  <EmptyState
    icon={Heart}
    title="No matches yet"
    description="Keep exploring profiles to find your perfect match. When you both like each other, it's a match!"
    action={onExplore ? { label: 'Explore Profiles', onClick: onExplore } : undefined}
  />
)

const NoMessagesEmpty: React.FC<{ onBrowse?: () => void }> = ({ onBrowse }) => (
  <EmptyState
    icon={MessageSquare}
    title="No messages yet"
    description="Start a conversation with your matches to get to know them better."
    action={onBrowse ? { label: 'Browse Matches', onClick: onBrowse } : undefined}
  />
)

const NoSearchResultsEmpty: React.FC<{ onClear?: () => void }> = ({
  onClear,
}) => (
  <EmptyState
    icon={Search}
    title="No results found"
    description="Try adjusting your search filters to find more profiles."
    action={onClear ? { label: 'Clear Filters', onClick: onClear } : undefined}
  />
)

const NoProfileViewsEmpty: React.FC = () => (
  <EmptyState
    icon={Users}
    title="No profile views yet"
    description="Complete your profile and add photos to attract more visitors."
  />
)

const NoNotificationsEmpty: React.FC = () => (
  <EmptyState
    icon={Bell}
    title="No notifications"
    description="You're all caught up! Check back later for new activity."
  />
)

const NoShortlistEmpty: React.FC<{ onBrowse?: () => void }> = ({ onBrowse }) => (
  <EmptyState
    icon={Heart}
    title="Your shortlist is empty"
    description="Save profiles you're interested in to compare them later."
    action={onBrowse ? { label: 'Browse Profiles', onClick: onBrowse } : undefined}
  />
)

const NoInterestsEmpty: React.FC<{ type: 'sent' | 'received' }> = ({ type }) => (
  <EmptyState
    icon={Heart}
    title={type === 'sent' ? 'No interests sent' : 'No interests received'}
    description={
      type === 'sent'
        ? 'Express interest in profiles you like to start a connection.'
        : 'Complete your profile to attract more interest from other members.'
    }
  />
)

export {
  EmptyState,
  NoMatchesEmpty,
  NoMessagesEmpty,
  NoSearchResultsEmpty,
  NoProfileViewsEmpty,
  NoNotificationsEmpty,
  NoShortlistEmpty,
  NoInterestsEmpty,
}
