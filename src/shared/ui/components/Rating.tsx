'use client'

import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Star } from 'lucide-react'

export interface RatingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  score: number // e.g. 4.8
  maxScore?: number
  reviewsCount?: number
  showScore?: boolean
  interactive?: boolean
  onChange?: (score: number) => void
}

export function Rating({
  score,
  maxScore = 5,
  reviewsCount,
  showScore = true,
  interactive = false,
  onChange,
  className,
  ...props
}: RatingProps) {
  return (
    <div
      className={twMerge(clsx('inline-flex items-center gap-1.5 select-none', className))}
      {...props}
    >
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxScore }).map((_, i) => {
          const filled = i < Math.floor(score)
          const half = !filled && i < score

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange?.(i + 1)}
              className={clsx(
                'p-0.5 transition-colors',
                interactive ? 'cursor-pointer min-h-[44px] min-w-[32px] flex items-center justify-center' : 'cursor-default pointer-events-none'
              )}
              aria-label={`${i + 1} Star`}
            >
              <Star
                className={clsx(
                  'h-4 w-4',
                  filled
                    ? 'fill-warningText text-warningText'
                    : half
                    ? 'fill-warningText/50 text-warningText'
                    : 'text-border fill-transparent'
                )}
                strokeWidth={1.75}
              />
            </button>
          )
        })}
      </div>

      {showScore && (
        <span className="text-small font-medium text-text ml-1">
          {score.toFixed(1)}
        </span>
      )}

      {reviewsCount !== undefined && (
        <span className="text-caption text-textSubtle">
          ({reviewsCount})
        </span>
      )}
    </div>
  )
}
