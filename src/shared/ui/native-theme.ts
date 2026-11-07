import { colors, font, radius, space, typeScale, controls, icons, shadows, layout } from './tokens'

/**
 * Shared React Native Theme generated strictly from GymApp design tokens.
 */
export const nativeTheme = {
  colors: {
    primary: colors.primary,
    primaryDark: colors.primaryDark,
    primaryLight: colors.primaryLight,
    background: colors.background,
    surface: colors.surface,
    border: colors.border,
    text: colors.text,
    textMuted: colors.textMuted,
    textSubtle: colors.textSubtle,
    successText: colors.successText,
    successBg: colors.successBg,
    warningText: colors.warningText,
    warningBg: colors.warningBg,
    dangerText: colors.dangerText,
    dangerBg: colors.dangerBg,
    featuredText: colors.featuredText,
    featuredBg: colors.featuredBg,
  },
  font: {
    family: font.family,
    weights: font.weights,
  },
  typography: {
    title: {
      fontSize: typeScale.title.mobileSize,
      fontWeight: '700' as const,
      lineHeight: typeScale.title.mobileSize * typeScale.title.lineHeight,
      color: colors.text,
    },
    section: {
      fontSize: typeScale.section.size,
      fontWeight: '500' as const,
      lineHeight: typeScale.section.size * typeScale.section.lineHeight,
      color: colors.text,
    },
    cardTitle: {
      fontSize: typeScale.cardTitle.size,
      fontWeight: '500' as const,
      lineHeight: typeScale.cardTitle.size * typeScale.cardTitle.lineHeight,
      color: colors.text,
    },
    body: {
      fontSize: typeScale.body.size,
      fontWeight: '400' as const,
      lineHeight: typeScale.body.size * typeScale.body.lineHeight,
      color: colors.text,
    },
    small: {
      fontSize: typeScale.small.size,
      fontWeight: '400' as const,
      lineHeight: typeScale.small.size * typeScale.small.lineHeight,
      color: colors.textMuted,
    },
    caption: {
      fontSize: typeScale.caption.size,
      fontWeight: '400' as const,
      lineHeight: typeScale.caption.size * typeScale.caption.lineHeight,
      color: colors.textSubtle,
    },
    button: {
      fontSize: typeScale.button.size,
      fontWeight: '500' as const,
      lineHeight: typeScale.button.size * typeScale.button.lineHeight,
      color: '#FFFFFF',
    },
  },
  radius: {
    control: radius.control,
    card: radius.card,
    pill: radius.pill,
  },
  spacing: {
    xs: space[0], // 4
    sm: space[1], // 8
    md: space[2], // 12
    lg: space[3], // 16
    xl: space[4], // 24
    xxl: space[5], // 32
    huge: space[6], // 48
  },
  controls: {
    minHeight: controls.minHeight,
    touchTarget: controls.touchTarget,
    focusRingWidth: controls.focusRingWidth,
    focusRingColor: controls.focusRingColor,
  },
  icons: {
    size: icons.size,
    strokeWidth: icons.strokeWidth,
  },
  layout: {
    pagePaddingMobile: layout.pagePaddingMobile,
    pagePaddingDesktop: layout.pagePaddingDesktop,
    borderWidth: layout.borderWidth,
  },
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    subtle: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 2,
      elevation: 1,
    },
  },
} as const

export default nativeTheme

