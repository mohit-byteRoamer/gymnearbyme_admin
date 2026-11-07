import {
  LayoutDashboard,
  CreditCard,
  Banknote,
  Building2,
  MapPin,
  Ticket,
  Sparkles,
  Users,
  ShieldCheck,
  Headphones,
  Bell,
  Database,
  BarChart3,
  FileText,
  UserCog,
  Settings,
} from 'lucide-react'

export interface NavItem {
  title: string
  href: string
  icon: any
  badgeKey?: 'pendingPayments' | 'pendingPayouts' | 'pendingApprovals' | 'pendingRefunds' | 'pendingNotifications'
}

/**
 * Top-level admin sidebar navigation items.
 * No section headers.
 */
export const NAVIGATION_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Master Data',
    href: '/master-data',
    icon: Database,
  },
  {
    title: 'Payments',
    href: '/payments',
    icon: CreditCard,
    badgeKey: 'pendingPayments',
  },
  {
    title: 'Payouts',
    href: '/payouts',
    icon: Banknote,
    badgeKey: 'pendingPayouts',
  },
  {
    title: 'Gyms',
    href: '/gyms',
    icon: Building2,
    badgeKey: 'pendingApprovals',
  },
  {
    title: 'Locations',
    href: '/localities',
    icon: MapPin,
  },
  {
    title: 'Vouchers',
    href: '/vouchers',
    icon: Ticket,
    badgeKey: 'pendingRefunds',
  },
  {
    title: 'Featured',
    href: '/featured',
    icon: Sparkles,
  },
  {
    title: 'Users',
    href: '/users',
    icon: Users,
  },
  {
    title: 'Moderation',
    href: '/moderation',
    icon: ShieldCheck,
  },
  {
    title: 'Support',
    href: '/support',
    icon: Headphones,
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
    badgeKey: 'pendingNotifications',
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
  },
  {
    title: 'Content & Legal',
    href: '/content',
    icon: FileText,
  },
  {
    title: 'Staff',
    href: '/staff',
    icon: UserCog,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]
