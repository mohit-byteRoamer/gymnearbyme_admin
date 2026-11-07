import * as React from 'react'
import { Badge as UIBadge, BadgeProps as UIBadgeProps } from '@/shared/ui'

export interface BadgeProps extends UIBadgeProps {
  variant?: any
}

export function Badge(props: BadgeProps) {
  return <UIBadge {...props} />
}

export default Badge
