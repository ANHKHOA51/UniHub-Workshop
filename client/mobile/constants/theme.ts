/**
 * UniHub Workshop — Design System
 * Premium dark-first color palette optimized for check-in staff usage
 * (often in dimly-lit event venues)
 */

import { Platform } from 'react-native';

// ─── Brand Palette ──────────────────────────────────────────
export const Brand = {
  /** Primary — Web's dark slate */
  primary: '#111827',
  primaryLight: '#F3F4F6', /* Màu sáng dùng cho các nút/icon nổi bật trong Dark Mode */
  primaryDark: '#030712',

  /** Accent — Web's secondary */
  accent: '#1F2937',
  accentLight: '#4B5563',
  accentDark: '#111827',

  /** Success — emerald green */
  success: '#10B981',
  successLight: '#34D399',
  successBg: 'rgba(16, 185, 129, 0.12)',

  /** Error — rose red */
  error: '#F43F5E',
  errorLight: '#FB7185',
  errorBg: 'rgba(244, 63, 94, 0.12)',

  /** Warning — amber */
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  warningBg: 'rgba(245, 158, 11, 0.12)',

  /** Info */
  info: '#3B82F6',
  infoBg: 'rgba(59, 130, 246, 0.12)',
};

// ─── Theme Colors ───────────────────────────────────────────
const tintColorLight = Brand.primary;
const tintColorDark = Brand.primaryLight;

export const Colors = {
  light: {
    text: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    background: '#F9FAFB',
    backgroundSecondary: '#F3F4F6',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    tint: tintColorLight,
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#D1D5DB', /* Sáng hơn để dễ đọc */
    textTertiary: '#9CA3AF',  /* Sáng hơn để dễ đọc */
    background: '#030712',
    backgroundSecondary: '#111827',
    surface: '#1F2937',
    surfaceElevated: '#374151',
    border: '#374151',
    borderLight: '#1F2937',
    tint: tintColorDark,
    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};

// ─── Spacing ────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

// ─── Border Radius ──────────────────────────────────────────
export const Radius = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  full: 999,
} as const;

// ─── Shadows ────────────────────────────────────────────────
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  }),
} as const;

// ─── Typography ─────────────────────────────────────────────
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
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Typography = {
  h1: { fontSize: 28, fontWeight: '800' as const, lineHeight: 34, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyBold: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  captionBold: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
  label: { fontSize: 11, fontWeight: '600' as const, lineHeight: 14, letterSpacing: 0.5 },
} as const;
