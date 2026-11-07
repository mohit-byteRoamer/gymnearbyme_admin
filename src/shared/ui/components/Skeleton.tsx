import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'text'
  width?: string | number
  height?: string | number
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const variantClasses = {
    rectangular: 'rounded-control',
    circular: 'rounded-full',
    text: 'rounded-[4px] h-4 w-full',
  }[variant]

  const inlineStyles: React.CSSProperties = {
    ...style,
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
  }

  return (
    <div
      className={twMerge(
        clsx('animate-pulse bg-border/60 shrink-0', variantClasses, className)
      )}
      style={inlineStyles}
      {...props}
    />
  )
}

export default Skeleton
