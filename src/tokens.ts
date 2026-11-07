/**
 * GymApp Admin Design Tokens - Single Source of Truth
 * Light mode only. Strictly restricted to these tokens.
 */

export const colors = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#EFF6FF',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  textMuted: '#475569',
  textSubtle: '#94A3B8',
  successText: '#166534',
  successBg: '#DCFCE7',
  warningText: '#92400E',
  warningBg: '#FEF3C7',
  dangerText: '#B91C1C',
  dangerBg: '#FEE2E2',
  featuredText: '#2563EB',
  featuredBg: '#EFF6FF',
} as const

export const font = {
  family: 'Roboto, sans-serif',
  weights: {
    regular: '400',
    medium: '500',
    bold: '700',
  },
} as const

export const radius = {
  control: '8px',
  card: '12px',
  pill: '9999px',
} as const

export const shadows = {
  none: 'none',
  subtle: '0 1px 2px rgba(15,23,42,0.06)',
} as const

export const textSizes = {
  pageTitle: { size: '24px', weight: '700', lineHeight: '32px' },
  sectionTitle: { size: '18px', weight: '500', lineHeight: '28px' },
  body: { size: '14px', weight: '400', lineHeight: '20px' },
  caption: { size: '12px', weight: '400', lineHeight: '16px' },
  badge: { size: '12px', weight: '500', lineHeight: '16px' },
  stat: { size: '28px', weight: '700', lineHeight: '36px' },
} as const

export const space = [4, 8, 12, 16, 24, 32, 48] as const

export const typeScale = {
  title: { size: 28, mobileSize: 24, weight: 700, lineHeight: 1.5 },
  section: { size: 20, mobileSize: 20, weight: 500, lineHeight: 1.5 },
  cardTitle: { size: 16, mobileSize: 16, weight: 500, lineHeight: 1.5 },
  body: { size: 14, mobileSize: 14, weight: 400, lineHeight: 1.5 },
  small: { size: 14, mobileSize: 14, weight: 400, lineHeight: 1.5 },
  caption: { size: 12, mobileSize: 12, weight: 400, lineHeight: 1.5 },
  button: { size: 14, mobileSize: 14, weight: 500, lineHeight: 1.5 },
} as const

export const layout = {
  maxWidth: 1280,
  pagePaddingMobile: 16,
  pagePaddingDesktop: 32,
  lineHeight: 1.5,
  borderWidth: 1,
} as const

export const controls = {
  minHeight: 40,
  minHeightMobile: 44,
  touchTarget: 44,
  focusRingWidth: 2,
  focusRingColor: colors.primary,
} as const

export const icons = {
  size: 20,
  strokeWidth: 1.75,
} as const
