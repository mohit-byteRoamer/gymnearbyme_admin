import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Card } from './Card'

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  subtext?: string
}

export function StatCard({
  label,
  value,
  subtext,
  className,
  ...props
}: StatCardProps) {
  return (
    <Card
      className={twMerge(
        clsx('flex flex-col justify-between p-6 space-y-2 bg-surface border border-border rounded-card shadow-subtle', className)
      )}
      {...props}
    >
      <span className="text-sm font-normal text-textMuted font-roboto">
        {label}
      </span>

      <div className="text-stat font-bold text-text tracking-tight font-roboto leading-9">
        {value}
      </div>

      {subtext && (
        <span className="text-sm font-normal text-textMuted font-roboto leading-5">
          {subtext}
        </span>
      )}
    </Card>
  )
}

export default StatCard
