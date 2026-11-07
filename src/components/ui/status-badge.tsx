import * as React from 'react'
import { StatusBadge as UIStatusBadge } from '@/shared/ui'

export function StatusBadge(props: { status: string; className?: string }) {
  return <UIStatusBadge {...props} />
}

export default StatusBadge
