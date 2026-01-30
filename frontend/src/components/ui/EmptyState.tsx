/**
 * Empty State Component
 * Display when no data is available
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './Button'
import {
  Search,
  FileText,
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

export {
  EmptyState,
  NoSearchResultsEmpty,
}
