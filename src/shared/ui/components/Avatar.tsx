'use client'

import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  className,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false)

  const sizeClasses = {
    sm: 'h-8 w-8 text-caption',
    md: 'h-10 w-10 text-small',
    lg: 'h-12 w-12 text-body',
    xl: 'h-16 w-16 text-cardTitle',
  }[size]

  const getInitials = (n?: string) => {
    if (!n) return 'U'
    const parts = n.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }

  return (
    <div
      className={twMerge(
        clsx(
          'relative rounded-full overflow-hidden bg-primaryLight text-primary font-medium flex items-center justify-center border border-border shrink-0 select-none',
          sizeClasses,
          className
        )
      )}
      {...props}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt || name || 'User avatar'}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  )
}

