import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { FolderOpen } from 'lucide-react'
import { Button } from './Button'

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode | React.ComponentType<{ className?: string; strokeWidth?: number }>
  title?: string
  description: string
  actionLabel?: string
  onAction?: () => void
  actionVariant?: 'primary' | 'secondary' | 'outline' | 'ghost'
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionVariant = 'secondary',
  className,
  ...props
}: EmptyStateProps) {
  const renderIcon = () => {
    if (!icon) return <FolderOpen className="h-5 w-5 text-textSubtle" strokeWidth={1.75} />
    if (typeof icon === 'function') {
      const IconComponent = icon as React.ComponentType<{ className?: string; strokeWidth?: number }>
      return <IconComponent className="h-5 w-5 text-textSubtle" strokeWidth={1.75} />
    }
    return icon
  }

  return (
    <div
      className={twMerge(
        clsx(
          'flex flex-col items-center justify-center text-center p-8 bg-surface border border-border rounded-card my-6 space-y-3 font-roboto',
          className
        )
      )}
      {...props}
    >
      <div className="text-textSubtle flex items-center justify-center">
        {renderIcon()}
      </div>

      {title && <h4 className="text-lg font-medium text-text">{title}</h4>}
      <p className="text-sm font-normal text-textMuted max-w-md">
        {description}
      </p>

      {actionLabel && onAction && (
        <div className="pt-2">
          <Button variant={actionVariant} onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  )
}

export default EmptyState
