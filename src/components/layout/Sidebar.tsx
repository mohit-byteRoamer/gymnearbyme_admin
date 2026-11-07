import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAdmin } from '@/context/admin-store'
import { NAVIGATION_ITEMS } from '@/config/navigation'
import { Dumbbell } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { vouchers, gyms, refunds } = useAdmin()

  // Calculate live badge counts
  const pendingPaymentsCount = vouchers.filter(
    (v) => v.status === 'FEE_PENDING_VERIFICATION'
  ).length
  const pendingApprovalsCount = gyms.filter(
    (g) => g.status === 'PENDING_APPROVAL'
  ).length
  const pendingRefundsCount = refunds.filter(
    (r) => r.status === 'REQUESTED'
  ).length

  const getBadgeCount = (key?: string) => {
    switch (key) {
      case 'pendingPayments':
        return pendingPaymentsCount
      case 'pendingPayouts':
        return 1
      case 'pendingApprovals':
        return pendingApprovalsCount
      case 'pendingRefunds':
        return pendingRefundsCount
      case 'pendingNotifications':
        return 2
      default:
        return null
    }
  }

  return (
    <aside className="w-16 lg:w-[240px] flex-shrink-0 bg-surface border-r border-border flex flex-col h-screen select-none sticky top-0 z-40 overflow-hidden font-roboto">
      {/* Top Header: 64px, Logo mark + "GymApp Admin" */}
      <div className="h-16 border-b border-border px-3 lg:px-5 flex items-center justify-center lg:justify-start gap-3 bg-surface">
        <div className="flex h-9 w-9 items-center justify-center rounded-control bg-primaryLight text-primary shrink-0">
          <Dumbbell className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="hidden lg:block truncate">
          <span className="font-bold text-base text-text tracking-tight block">
            GymApp Admin
          </span>
        </div>
      </div>

      {/* Navigation List: scrollable if needed, no section headings */}
      <nav className="flex-1 px-2 lg:px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main Navigation">
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon
          const badgeValue = getBadgeCount(item.badgeKey)
          const hasBadge = badgeValue !== null

          return (
            <NavLink
              key={item.href}
              to={item.href}
              title={item.title}
              className={({ isActive }) =>
                cn(
                  'h-10 flex items-center justify-between rounded-control px-2.5 lg:px-3 transition-colors text-sm font-roboto',
                  isActive
                    ? 'bg-primaryLight text-primary font-medium'
                    : 'text-textMuted hover:bg-background hover:text-text font-normal'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={cn(
                        'h-5 w-5 shrink-0 transition-colors',
                        isActive ? 'text-primary' : 'text-textMuted'
                      )}
                      strokeWidth={1.75}
                    />
                    <span className="hidden lg:inline truncate">
                      {item.title}
                    </span>
                  </div>

                  {/* Badges only for Payments, Gyms, Vouchers */}
                  {hasBadge && (
                    <span
                      className={cn(
                        'hidden lg:inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium leading-none shrink-0',
                        badgeValue > 0
                          ? 'bg-primary text-white'
                          : 'bg-background text-textSubtle border border-border'
                      )}
                    >
                      {badgeValue}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
