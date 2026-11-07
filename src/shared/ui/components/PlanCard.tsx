import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Check } from 'lucide-react'
import { Card } from './Card'
import { Button } from './Button'
import { formatMoney } from '../formatters'

export interface PlanCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  durationDays: number
  pricePaise: number
  description?: string
  features?: string[]
  isPopular?: boolean
  feePaise?: number
  balancePaise?: number
  onSelect?: () => void
  selectButtonLabel?: string
  buttonVariant?: 'primary' | 'secondary'
}

export function PlanCard({
  name,
  durationDays,
  pricePaise,
  description,
  features = [],
  isPopular = false,
  feePaise,
  balancePaise,
  onSelect,
  selectButtonLabel = 'Select Plan',
  buttonVariant = 'primary',
  className,
  ...props
}: PlanCardProps) {
  return (
    <Card
      className={twMerge(
        clsx(
          'flex flex-col justify-between space-y-6 transition-all',
          isPopular ? 'border-primary ring-1 ring-primary' : 'border-border',
          className
        )
      )}
      {...props}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-small font-medium text-textMuted px-2.5 py-1 bg-background rounded-pill border border-border">
            {durationDays} Days Duration
          </span>
          {isPopular && (
            <span className="text-caption font-bold text-primary bg-primaryLight px-2 py-0.5 rounded-pill border border-primary/20">
              POPULAR
            </span>
          )}
        </div>

        <div>
          <h4 className="text-section font-medium text-text">{name}</h4>
          {description && (
            <p className="text-small text-textMuted mt-1 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="pt-2 border-t border-border">
          <span className="text-caption text-textMuted block">Club Membership Price</span>
          <div className="text-2xl sm:text-title font-bold text-text font-roboto">
            {formatMoney(pricePaise)}
          </div>
        </div>

        {/* Optional Fee Breakdown (Rule 1) */}
        {feePaise !== undefined && balancePaise !== undefined && (
          <div className="p-3 rounded-control bg-background border border-border space-y-1.5 text-caption">
            <div className="flex items-center justify-between text-primary font-medium">
              <span>Pass Fee (via UPI):</span>
              <span className="font-bold">{formatMoney(feePaise)}</span>
            </div>
            <div className="flex items-center justify-between text-successText font-medium">
              <span>Balance at Gym Desk:</span>
              <span className="font-bold">{formatMoney(balancePaise)}</span>
            </div>
            <div className="text-textSubtle pt-1 border-t border-border/80">
              0% fee on subsequent month renewals
            </div>
          </div>
        )}

        {/* Features List */}
        {features.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-medium text-textMuted block">
              Included features
            </span>
            <ul className="space-y-2">
              {features.map((feat, i) => (
                <li key={i} className="flex items-start gap-2 text-small text-textMuted">
                  <div className="h-4 w-4 rounded-full bg-primaryLight text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                  </div>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-border">
        <Button
          variant={buttonVariant}
          className="w-full"
          onClick={onSelect}
        >
          {selectButtonLabel}
        </Button>
      </div>
    </Card>
  )
}

