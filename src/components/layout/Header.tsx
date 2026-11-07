import React, { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAdmin } from '@/context/admin-store'
import { Bell, User, LogOut, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Header() {
  const { currentUser, vouchers, logout } = useAdmin()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Page title resolution
  const path = location.pathname
  const getPageTitle = () => {
    if (path.startsWith('/dashboard')) return 'Dashboard'
    if (path.startsWith('/payments')) return 'Payments'
    if (path.startsWith('/payouts')) return 'Payouts'
    if (path.match(/^\/gyms\/[^/]+/)) return 'Gym Details'
    if (path.startsWith('/gyms') || path.startsWith('/approvals')) return 'Gyms Directory'
    if (path.startsWith('/vouchers') || path.startsWith('/refunds')) return 'Vouchers'
    if (path.startsWith('/featured')) return 'Featured Listings'
    if (path.startsWith('/users')) return 'Users'
    if (path.startsWith('/moderation')) return 'Media & Reviews'
    if (path.startsWith('/support')) return 'Support & Tickets'
    if (path.startsWith('/notifications')) return 'Notifications & Broadcasts'
    if (path.startsWith('/master-data')) return 'Master Data'
    if (path.startsWith('/reports')) return 'Reports & Analytics'
    if (path.startsWith('/content') || path.startsWith('/cms') || path.startsWith('/legal')) return 'Content & Legal Pages'
    if (path.startsWith('/staff')) return 'Staff & Roles'
    if (path.startsWith('/localities') || path.startsWith('/locations')) return 'Locations & Operating Cities'
    if (
      path.startsWith('/settings') ||
      path.startsWith('/audit')
    ) {
      return 'Settings'
    }
    return 'Admin Panel'
  }

  const pendingPaymentsCount = vouchers.filter(
    (v) => v.status === 'FEE_PENDING_VERIFICATION'
  ).length

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-surface border-b border-border px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 font-roboto">
      {/* Left: Page Title (24/700) */}
      <h1 className="text-2xl font-bold text-text leading-8 tracking-tight font-roboto">
        {getPageTitle()}
      </h1>

      {/* Right: Notification Bell Popover + Avatar Menu */}
      <div className="flex items-center gap-4">
        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            title="Notifications & System Alerts"
            className="relative min-h-[40px] min-w-[40px] flex items-center justify-center rounded-control text-textMuted hover:text-text hover:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" strokeWidth={1.75} />
            <span
              className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary"
              aria-hidden="true"
            />
          </button>

          {/* Notifications Popover Menu */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-card bg-surface border border-border shadow-xl z-50 overflow-hidden font-roboto animate-in fade-in slide-in-from-top-1">
              <div className="p-3.5 border-b border-border flex items-center justify-between bg-background/50">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-text">Notifications</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primaryLight text-primary">
                    3 New
                  </span>
                </div>
                <button
                  onClick={() => setNotifOpen(false)}
                  className="text-xs text-textMuted hover:text-primary transition-colors font-medium"
                >
                  Mark all read
                </button>
              </div>

              <div className="divide-y divide-border max-h-80 overflow-y-auto">
                <div
                  onClick={() => {
                    setNotifOpen(false)
                    navigate('/payments?drawer=pay_LDH_1001')
                  }}
                  className="p-3 hover:bg-background cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-successText" />
                      Payment Captured
                    </span>
                    <span className="text-[10px] text-textSubtle">25m ago</span>
                  </div>
                  <p className="text-xs text-textMuted">
                    Amritpal Singh paid ₹2,999 for Cult Gym pass. Commission ₹599.80 allocated.
                  </p>
                </div>

                <div
                  onClick={() => {
                    setNotifOpen(false)
                    navigate('/payouts')
                  }}
                  className="p-3 hover:bg-background cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Route Payout Settled
                    </span>
                    <span className="text-[10px] text-textSubtle">1h ago</span>
                  </div>
                  <p className="text-xs text-textMuted">
                    Transfer of ₹800 settled to Anytime Fitness Model Town bank account.
                  </p>
                </div>

                <div
                  onClick={() => {
                    setNotifOpen(false)
                    navigate('/payments?tab=needs-review')
                  }}
                  className="p-3 hover:bg-background cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-warningText flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-warningText" />
                      KYC Review Required
                    </span>
                    <span className="text-[10px] text-textSubtle">2h ago</span>
                  </div>
                  <p className="text-xs text-textMuted">
                    Titan Strength Club bank verification is pending. Transfer held.
                  </p>
                </div>

                <div
                  onClick={() => {
                    setNotifOpen(false)
                    navigate('/notifications')
                  }}
                  className="p-3 hover:bg-background cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                      Broadcast Campaign
                    </span>
                    <span className="text-[10px] text-textSubtle">3d ago</span>
                  </div>
                  <p className="text-xs text-textMuted">
                    "Diwali Fitness Fest" successfully delivered to 6 partner gyms.
                  </p>
                </div>
              </div>

              <div className="p-2.5 border-t border-border bg-background text-center">
                <button
                  onClick={() => {
                    setNotifOpen(false)
                    navigate('/notifications')
                  }}
                  className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                >
                  <span>Open Notifications & Broadcasts Hub</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Avatar Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
            aria-expanded={menuOpen}
            aria-haspopup="true"
            aria-label="User profile menu"
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-9 w-9 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-primaryLight text-primary flex items-center justify-center text-sm font-medium">
                {currentUser?.name?.charAt(0) || 'A'}
              </div>
            )}
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-card border border-border bg-surface p-1 shadow-subtle z-50 animate-in fade-in-50 zoom-in-95">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-sm font-medium text-text truncate">{currentUser?.name}</p>
                <p className="text-xs text-textMuted truncate">{currentUser?.email}</p>
                <span className="inline-block mt-1 text-xs text-primary font-medium">
                  {currentUser?.role?.replace('_', ' ')}
                </span>
              </div>

              <div className="py-1">
                <Link
                  to="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-text hover:bg-background rounded-control transition-colors"
                >
                  <Settings className="h-4 w-4 text-textMuted" strokeWidth={1.75} />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-dangerText hover:bg-dangerBg rounded-control transition-colors text-left"
                >
                  <LogOut className="h-4 w-4 text-dangerText" strokeWidth={1.75} />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
