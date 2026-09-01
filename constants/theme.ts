/**
 * Design tokens for LeBonSport — single source of truth for color, spacing and radius.
 * Real screens should consume these via hooks/useTheme.ts, not hardcode hex values.
 */

import { Platform } from 'react-native';

const palette = {
  green50: '#F0FBF5',
  green100: '#E8F5F0',
  green500: '#16A06A',
  green600: '#0D8A52',
  green700: '#0D7A4F',
  greenGradientA: '#2ECC8F',
  greenGradientB: '#1AAD6E',

  neutral0: '#FFFFFF',
  neutral50: '#F8FAF9',
  neutral100: '#F3F4F6',
  neutral200: '#E8EDE9',
  neutral300: '#E5E7EB',
  neutral500: '#9CA3AF',
  neutral600: '#6B7280',
  neutral900: '#0F1F17',

  error: '#991B1B',
  errorBg: '#FEE2E2',
  warning: '#F39C12',
};

// Palette unique vert + blanc — pas de mode sombre, pas de noir.
export const Colors = {
  light: {
    background: palette.neutral50,
    surface: palette.neutral0,
    surfaceAlt: palette.neutral100,
    border: palette.neutral300,
    text: palette.neutral900,
    textMuted: palette.neutral600,
    textSubtle: palette.neutral500,
    primary: palette.green500,
    primaryDark: palette.green700,
    primaryLight: palette.green100,
    gradientStart: palette.greenGradientA,
    gradientMid: palette.greenGradientB,
    gradientEnd: palette.green600,
    tint: palette.green500,
    icon: palette.neutral600,
    tabIconDefault: palette.neutral600,
    tabIconSelected: palette.green500,
    success: palette.green500,
    error: palette.error,
    errorBg: palette.errorBg,
    warning: palette.warning,
  },
};

export const Spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const Radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 };

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
