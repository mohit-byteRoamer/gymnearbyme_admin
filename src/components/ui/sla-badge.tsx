import React from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SlaBadgeProps {
  createdAt: string
  slaMinutes?: number
  className?: string
}

export function SlaBadge({ createdAt, slaMinutes = 30, className }: SlaBadgeProps) {
  const createdTime = new Date(createdAt).getTime()
  const minutesWaiting = Math.max(1, Math.round((Date.now() - createdTime) / (60 * 1000)))
  const isOverdue = minutesWaiting > slaMinutes

  if (isOverdue) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full bg-warningBg px-2.5 py-0.5 text-xs font-medium text-warningText font-roboto',
          className
        )}
      >
        <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
        Waiting {minutesWaiting} min
      </span>
    )
  }

  const minutesRemaining = slaMinutes - minutesWaiting

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-successBg px-2.5 py-0.5 text-xs font-medium text-successText font-roboto',
        className
      )}
    >
      <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
      {minutesRemaining} min left
    </span>
  )
}

export default SlaBadge
