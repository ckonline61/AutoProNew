/**
 * Auto Pro Design System — Typography
 */
import { TextStyle } from 'react-native';

export const FONT_SIZES = {
  xs:    10,
  sm:    12,
  md:    14,
  lg:    16,
  xl:    18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
  '5xl': 32,
} as const;

export const FONT_WEIGHTS: Record<string, TextStyle['fontWeight']> = {
  regular:  '400',
  medium:   '500',
  semibold: '600',
  bold:     '700',
  extrabold:'800',
};

export const LINE_HEIGHTS = {
  tight:  1.2,
  normal: 1.4,
  relaxed:1.6,
};

/**
 * Pre-composed text styles matching the mockup designs.
 */
export const TYPOGRAPHY: Record<string, TextStyle> = {
  // Headings
  h1: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
  h2: { fontSize: 24, fontWeight: '700', lineHeight: 30 },
  h3: { fontSize: 20, fontWeight: '600', lineHeight: 26 },
  h4: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  h5: { fontSize: 16, fontWeight: '600', lineHeight: 22 },

  // Body
  bodyLarge:  { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  body:       { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  bodySmall:  { fontSize: 12, fontWeight: '400', lineHeight: 18 },
  bodySemibold: { fontSize: 14, fontWeight: '600', lineHeight: 20 },

  // Captions & Labels
  caption:    { fontSize: 10, fontWeight: '400', lineHeight: 14 },
  label:      { fontSize: 12, fontWeight: '600', lineHeight: 16 },
  labelSmall: { fontSize: 10, fontWeight: '600', lineHeight: 14 },

  // Buttons
  buttonLarge:  { fontSize: 16, fontWeight: '700', lineHeight: 22 },
  buttonMedium: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  buttonSmall:  { fontSize: 12, fontWeight: '600', lineHeight: 16 },

  // Prices
  priceLarge: { fontSize: 20, fontWeight: '700', lineHeight: 26 },
  price:      { fontSize: 16, fontWeight: '700', lineHeight: 22 },
  priceSmall: { fontSize: 14, fontWeight: '700', lineHeight: 20 },
  priceStrikethrough: { fontSize: 12, fontWeight: '400', lineHeight: 18, textDecorationLine: 'line-through' },
};
