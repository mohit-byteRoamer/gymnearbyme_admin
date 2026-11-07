import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { getStatusBadgeConfig, StatusColorType } from '../formatters'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: StatusColorType | 'outline' | 'default'
  status?: string
}

export function Badge({
  children,
  className,
  variant,
  status,
  ...props
}: BadgeProps) {
  let mappedVariant: StatusColorType = 'grey'
  let labelText = children

  if (status) {
    const config = getStatusBadgeConfig(status)
    mappedVariant = config.variant
    if (!children) {
      labelText = config.label
    }
  } else if (variant && variant !== 'outline' && variant !== 'default') {
    mappedVariant = variant
  }

  const variantClasses: Record<StatusColorType, string> = {
    green: 'bg-successBg text-successText border border-transparent',
    yellow: 'bg-warningBg text-warningText border border-transparent',
    red: 'bg-dangerBg text-dangerText border border-transparent',
    blue: 'bg-primaryLight text-primary border border-transparent',
    grey: 'bg-background text-textMuted border border-border',
  }

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium font-roboto select-none transition-colors leading-4',
          variantClasses[mappedVariant],
          className
        )
      )}
      {...props}
    >
      {labelText}
    </span>
  )
}

export function StatusBadge({
  status,
  className,
  ...props
}: {
  status: string
  className?: string
} & React.HTMLAttributes<HTMLSpanElement>) {
  return <Badge status={status} className={className} {...props} />
}

export default Badge
