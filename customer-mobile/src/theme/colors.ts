/**
 * Auto Pro Design System — Color Palette
 *
 * Extracted from the 36-screen mockup designs.
 * Red/Black brand identity with clean white surfaces.
 */

export const COLORS = {
  // ── Brand ──────────────────────────────────────────────
  primary:        '#DC2626',   // Main red (CTAs, active tabs, branding)
  primaryDark:    '#B91C1C',   // Pressed / dark variant
  primaryLight:   '#FEE2E2',   // Light red tint (backgrounds, badges)
  primaryGradientStart: '#DC2626',
  primaryGradientEnd:   '#991B1B',

  // ── Neutrals ──────────────────────────────────────────
  black:          '#1A1A1A',
  white:          '#FFFFFF',
  background:     '#F5F5F5',   // Screen backgrounds
  surface:        '#FFFFFF',   // Card / surface backgrounds
  surfaceElevated:'#FAFAFA',   // Slightly elevated surfaces

  // ── Text ──────────────────────────────────────────────
  textPrimary:    '#1A1A1A',
  textSecondary:  '#6B7280',
  textMuted:      '#9CA3AF',
  textOnPrimary:  '#FFFFFF',   // Text on red backgrounds
  textLink:       '#DC2626',

  // ── Borders & Dividers ────────────────────────────────
  border:         '#E5E7EB',
  borderLight:    '#F3F4F6',
  divider:        '#F0F0F0',

  // ── Status / Semantic ─────────────────────────────────
  success:        '#10B981',
  successLight:   '#D1FAE5',
  warning:        '#F59E0B',
  warningLight:   '#FEF3C7',
  error:          '#EF4444',
  errorLight:     '#FEE2E2',
  info:           '#3B82F6',
  infoLight:      '#DBEAFE',

  // ── Specific UI Elements ──────────────────────────────
  starGold:       '#FBBF24',   // Star ratings
  emergencyRed:   '#DC2626',   // Emergency banners
  mapOverlay:     'rgba(0,0,0,0.4)',
  overlay:        'rgba(0,0,0,0.5)',
  shimmer:        '#E5E7EB',   // Skeleton loading

  // ── Tab Bar ───────────────────────────────────────────
  tabActive:      '#DC2626',
  tabInactive:    '#9CA3AF',
  tabBarBg:       '#FFFFFF',
  tabBarBorder:   '#E5E7EB',

  // ── Gray Scale ────────────────────────────────────────
  gray50:         '#F9FAFB',
  gray100:        '#F3F4F6',
  gray200:        '#E5E7EB',
  gray300:        '#D1D5DB',
  gray400:        '#9CA3AF',
  gray500:        '#6B7280',
  gray600:        '#4B5563',
  gray700:        '#374151',
  gray800:        '#1F2937',
  gray900:        '#111827',
} as const;

export type ColorKey = keyof typeof COLORS;
