import { colors, radius, shadows } from './tokens'

/**
 * Shared Tailwind CSS Preset generated strictly from GymApp design tokens.
 */
export const tailwindPreset = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: colors.primary,
          dark: colors.primaryDark,
          light: colors.primaryLight,
        },
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
        // Semantic aliases
        card: colors.surface,
        ring: colors.primary,
        input: colors.border,
        destructive: {
          DEFAULT: colors.dangerText,
          bg: colors.dangerBg,
        },
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
      borderRadius: {
        control: radius.control,
        card: radius.card,
        pill: radius.pill,
        sm: radius.control,
        md: radius.control,
        lg: radius.card,
        xl: radius.card,
        full: radius.pill,
      },
      boxShadow: {
        none: shadows.none,
        subtle: shadows.subtle,
        sm: shadows.subtle,
        DEFAULT: shadows.subtle,
        md: shadows.subtle,
        lg: shadows.subtle,
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['14px', { lineHeight: '20px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        stat: ['28px', { lineHeight: '36px' }],
        '3xl': ['28px', { lineHeight: '36px' }],
      },
      minHeight: {
        control: '40px',
        controlMobile: '44px',
      },
    },
  },
}

export default tailwindPreset
