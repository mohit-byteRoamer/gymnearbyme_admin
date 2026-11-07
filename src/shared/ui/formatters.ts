import { colors } from './tokens'

/**
 * Format monetary amount in paise into standard Indian Rupee notation: ₹1,000
 */
export function formatMoney(paise: number): string {
  const rupees = Math.round(paise / 100)
  return `₹${rupees.toLocaleString('en-IN')}`
}

/**
 * Format monetary amount in Rupees directly into standard Indian Rupee notation: ₹1,000
 */
export function formatRupees(rupees: number): string {
  return `₹${Math.round(rupees).toLocaleString('en-IN')}`
}

/**
 * Format date string or Date object into standard "31 Oct 2026" notation.
 */
export function formatDate(input: string | Date | number): string {
  if (!input) return '—'
  const date = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input
  if (isNaN(date.getTime())) return '—'

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  return `${day} ${month} ${year}`
}

/**
 * Format time string or Date object into standard "6:30 PM" notation.
 */
export function formatTime(input: string | Date | number): string {
  if (!input) return '—'
  const date = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input
  if (isNaN(date.getTime())) return '—'

  let hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours ? hours : 12
  const minutesStr = minutes < 10 ? `0${minutes}` : minutes

  return `${hours}:${minutesStr} ${ampm}`
}

/**
 * Convert snake_case or SCREAMING_SNAKE to Sentence case.
 * e.g. "PENDING_APPROVAL" -> "Pending approval"
 *      "FEE_PENDING_VERIFICATION" -> "Pending verification"
 */
export function toSentenceCase(str: string): string {
  if (!str) return ''
  const cleaned = str
    .replace(/^FEE_PENDING_VERIFICATION$/, 'Pending verification')
    .replace(/^PENDING_APPROVAL$/, 'Pending approval')
    .replace(/_/g, ' ')
    .toLowerCase()
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

export type StatusColorType = 'green' | 'yellow' | 'red' | 'blue' | 'grey'

export interface StatusBadgeConfig {
  variant: StatusColorType
  label: string
  textColor: string
  bgColor: string
  borderClass: string
}

/**
 * Status mapping according to strict design system rules:
 * - Green: active, paid, approved, verified
 * - Yellow: pending, verifying, requested, expiring
 * - Red: rejected, blocked, suspended, expired, cancelled
 * - Blue: featured
 * - Grey: draft, inactive
 * All labels in Sentence case (e.g. "Active", "Pending approval").
 */
export function getStatusBadgeConfig(status: string): StatusBadgeConfig {
  const normalized = (status || '').toLowerCase().trim()
  const sentenceLabel = toSentenceCase(status)

  // GREEN: active / paid / approved / verified / redeemed
  if (
    normalized === 'active' ||
    normalized === 'paid' ||
    normalized === 'approved' ||
    normalized === 'verified' ||
    normalized === 'redeemed'
  ) {
    return {
      variant: 'green',
      label: sentenceLabel,
      textColor: colors.successText,
      bgColor: colors.successBg,
      borderClass: 'border-transparent',
    }
  }

  // YELLOW: pending / verifying / requested / expiring
  if (
    normalized.includes('pending') ||
    normalized.includes('verifying') ||
    normalized.includes('requested') ||
    normalized.includes('expiring')
  ) {
    return {
      variant: 'yellow',
      label: sentenceLabel,
      textColor: colors.warningText,
      bgColor: colors.warningBg,
      borderClass: 'border-transparent',
    }
  }

  // RED: rejected / blocked / suspended / expired / cancelled
  if (
    normalized === 'rejected' ||
    normalized === 'blocked' ||
    normalized === 'suspended' ||
    normalized === 'expired' ||
    normalized === 'cancelled'
  ) {
    return {
      variant: 'red',
      label: sentenceLabel,
      textColor: colors.dangerText,
      bgColor: colors.dangerBg,
      borderClass: 'border-transparent',
    }
  }

  // BLUE: featured
  if (normalized === 'featured') {
    return {
      variant: 'blue',
      label: 'Featured',
      textColor: colors.featuredText,
      bgColor: colors.featuredBg,
      borderClass: 'border-transparent',
    }
  }

  // GREY: draft / inactive
  return {
    variant: 'grey',
    label: sentenceLabel || 'Draft',
    textColor: colors.textMuted,
    bgColor: colors.background,
    borderClass: 'border-border',
  }
}
