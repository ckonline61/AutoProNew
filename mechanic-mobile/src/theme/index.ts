/**
 * Auto Pro Mechanic App — Theme (matching customer app brand identity)
 */

export const COLORS = {
  // Brand
  primary:        '#DC2626',
  primaryDark:    '#B91C1C',
  primaryLight:   '#FEE2E2',

  // Neutrals
  black:          '#1A1A1A',
  white:          '#FFFFFF',
  background:     '#F5F5F5',
  surface:        '#FFFFFF',

  // Text
  textPrimary:    '#1A1A1A',
  textSecondary:  '#6B7280',
  textMuted:      '#9CA3AF',
  textOnPrimary:  '#FFFFFF',

  // Borders
  border:         '#E5E7EB',
  borderLight:    '#F3F4F6',
  divider:        '#F0F0F0',

  // Status
  success:        '#10B981',
  successLight:   '#D1FAE5',
  warning:        '#F59E0B',
  warningLight:   '#FEF3C7',
  error:          '#EF4444',
  errorLight:     '#FEE2E2',
  info:           '#3B82F6',
  infoLight:      '#DBEAFE',

  // Specific
  starGold:       '#FBBF24',
  online:         '#10B981',
  offline:        '#9CA3AF',

  // Tab Bar
  tabActive:      '#DC2626',
  tabInactive:    '#9CA3AF',
  tabBarBg:       '#FFFFFF',

  // Gray Scale
  gray50:         '#F9FAFB',
  gray100:        '#F3F4F6',
  gray200:        '#E5E7EB',
  gray300:        '#D1D5DB',
  gray400:        '#9CA3AF',
  gray500:        '#6B7280',
  gray600:        '#4B5563',
  gray700:        '#374151',
  gray800:        '#1F2937',
} as const;

export const SPACING = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
} as const;

export const RADII = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  full: 999,
} as const;

export const SHADOWS = {
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
} as const;
