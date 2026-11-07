import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { MapPin, ShieldCheck, ArrowRight } from 'lucide-react'
import { Card } from './Card'
import { Badge } from './Badge'
import { Rating } from './Rating'
import { Button } from './Button'
import { formatMoney } from '../formatters'

export interface GymCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  slug: string
  imageUrl?: string
  localityName?: string
  ratingAvg?: number
  ratingCount?: number
  startingPricePaise?: number
  verified?: boolean
  isFeatured?: boolean
  facilities?: string[]
  onViewPlans?: () => void
  viewPlansHref?: string
}

export function GymCard({
  name,
  slug,
  imageUrl,
  localityName,
  ratingAvg = 4.5,
  ratingCount = 0,
  startingPricePaise,
  verified = true,
  isFeatured = false,
  facilities = [],
  onViewPlans,
  viewPlansHref,
  className,
  ...props
}: GymCardProps) {
  const fallbackImage =
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop'

  return (
    <Card
      padding="none"
      className={twMerge(
        clsx(
          'overflow-hidden flex flex-col justify-between hover:border-primary/50 transition-all duration-200 group',
          isFeatured ? 'border-primaryLight ring-1 ring-primaryLight' : '',
          className
        )
      )}
      {...props}
    >
      <div>
        {/* Cover Image */}
        <div className="relative h-44 w-full bg-border overflow-hidden">
          <img
            src={imageUrl || fallbackImage}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            {isFeatured ? (
              <Badge variant="blue">Featured</Badge>
            ) : verified ? (
              <Badge variant="green">Verified</Badge>
            ) : (
              <Badge variant="grey">PARTNER</Badge>
            )}

            <div className="bg-surface/90 backdrop-blur-sm px-2 py-1 rounded-control shadow-subtle border border-border">
              <Rating score={ratingAvg} reviewsCount={ratingCount} showScore />
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 space-y-3">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-cardTitle font-medium text-text group-hover:text-primary transition-colors line-clamp-1">
                {name}
              </h3>
              {verified && (
                <ShieldCheck
                  className="h-4 w-4 text-successText shrink-0"
                  strokeWidth={1.75}
                />
              )}
            </div>

            {localityName && (
              <div className="flex items-center gap-1 text-small text-textMuted mt-1">
                <MapPin className="h-4 w-4 text-textSubtle shrink-0" strokeWidth={1.75} />
                <span>{localityName}</span>
              </div>
            )}
          </div>

          {facilities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {facilities.slice(0, 3).map((f) => (
                <span
                  key={f}
                  className="px-2 py-0.5 rounded-[4px] bg-background text-caption text-textMuted border border-border"
                >
                  {f}
                </span>
              ))}
              {facilities.length > 3 && (
                <span className="px-1.5 py-0.5 rounded-[4px] bg-background text-caption text-textSubtle">
                  +{facilities.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer / Pricing & CTA */}
      <div className="p-4 sm:p-5 pt-3 border-t border-border flex items-center justify-between bg-surface">
        <div>
          <span className="text-caption text-textMuted block">Starting from</span>
          <span className="text-body font-bold text-text">
            {startingPricePaise ? formatMoney(startingPricePaise) : '₹1,500'}{' '}
            <span className="text-caption font-normal text-textSubtle">/ mo</span>
          </span>
        </div>

        {viewPlansHref ? (
          <a
            href={viewPlansHref}
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-3.5 py-2 text-small font-medium bg-primary text-white rounded-control hover:bg-primaryDark transition-colors shadow-subtle gap-1.5"
          >
            <span>View Plans</span>
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </a>
        ) : (
          <Button variant="primary" size="sm" onClick={onViewPlans} rightIcon={<ArrowRight className="h-4 w-4" strokeWidth={1.75} />}>
            View Plans
          </Button>
        )}
      </div>
    </Card>
  )
}

