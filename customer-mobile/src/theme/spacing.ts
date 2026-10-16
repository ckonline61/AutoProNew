/**
 * Auto Pro Design System — Spacing, Radii & Shadows
 */
import { ViewStyle } from 'react-native';

// ── Spacing Scale ───────────────────────────────────────
export const SPACING = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

// ── Border Radii ────────────────────────────────────────
export const RADII = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl': 24,
  full: 999,   // Pills, circles, avatars
} as const;

// ── Elevation / Shadows ─────────────────────────────────
export const SHADOWS: Record<string, ViewStyle> = {
  none: {},
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
};

// ── Common Layout Helpers ───────────────────────────────
export const LAYOUT: Record<string, ViewStyle> = {
  screenPadding: {
    paddingHorizontal: SPACING.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex1: {
    flex: 1,
  },
};

// ── Icon Sizes ──────────────────────────────────────────
export const ICON_SIZES = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

// ── Hit Slop ────────────────────────────────────────────
export const HIT_SLOP = {
  small: { top: 8, right: 8, bottom: 8, left: 8 },
  medium: { top: 12, right: 12, bottom: 12, left: 12 },
  large: { top: 16, right: 16, bottom: 16, left: 16 },
} as const;

// ── Bottom Tab Bar ──────────────────────────────────────
export const TAB_BAR = {
  height: 60,
  iconSize: 22,
  labelSize: 10,
} as const;
