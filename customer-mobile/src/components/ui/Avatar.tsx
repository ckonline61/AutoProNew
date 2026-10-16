import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII } from '../../theme';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  /** Remote image URL */
  uri?: string | null;
  /** Name used to generate initials and accessibility label */
  name?: string;
  /** Size variant: sm (32px), md (44px), lg (64px), or custom number */
  size?: AvatarSize | number;
  /** Optional status indicator dot at bottom right */
  status?: 'online' | 'offline' | 'busy';
  /** Background color override for initials placeholder */
  backgroundColor?: string;
  /** Text color override for initials */
  textColor?: string;
  /** Optional press handler */
  onPress?: () => void;
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
}

const SIZE_CONFIG: Record<AvatarSize, { diameter: number; fontSize: number; statusSize: number }> = {
  sm: { diameter: 32, fontSize: 12, statusSize: 8 },
  md: { diameter: 44, fontSize: 16, statusSize: 10 },
  lg: { diameter: 64, fontSize: 22, statusSize: 14 },
};

const STATUS_COLORS: Record<'online' | 'offline' | 'busy', string> = {
  online: COLORS.success,
  offline: COLORS.gray400,
  busy: COLORS.primary,
};

/** Extracts up to 2 uppercase initials from a name string */
const getInitials = (name?: string): string => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/** Generates a deterministic pleasing background color based on name */
const PALETTE = [
  '#FEE2E2', // red light
  '#DBEAFE', // blue light
  '#D1FAE5', // green light
  '#FEF3C7', // amber light
  '#EDE9FE', // purple light
  '#F3E8FF', // violet light
];

const TEXT_PALETTE = [
  COLORS.primary,
  '#1D4ED8',
  '#065F46',
  '#B45309',
  '#6D28D9',
  '#7E22CE',
];

const getColorForName = (name?: string) => {
  if (!name) return { bg: COLORS.primaryLight, text: COLORS.primary };
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTE.length;
  return { bg: PALETTE[index], text: TEXT_PALETTE[index] };
};

const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = 'md',
  status,
  backgroundColor,
  textColor,
  onPress,
  style,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  const config =
    typeof size === 'number'
      ? {
          diameter: size,
          fontSize: Math.round(size * 0.38),
          statusSize: Math.max(8, Math.round(size * 0.22)),
        }
      : SIZE_CONFIG[size] || SIZE_CONFIG.md;

  const initials = getInitials(name);
  const colorPair = getColorForName(name);
  const bgColor = backgroundColor || colorPair.bg;
  const fgColor = textColor || colorPair.text;

  const hasValidImage = !!uri && !imageFailed;

  const avatarContent = (
    <View
      style={[
        styles.avatarContainer,
        {
          width: config.diameter,
          height: config.diameter,
          borderRadius: config.diameter / 2,
          backgroundColor: hasValidImage ? COLORS.gray100 : bgColor,
        },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel={name ? `Avatar for ${name}` : 'User avatar'}
    >
      {hasValidImage ? (
        <Image
          source={{ uri: uri! }}
          style={[
            styles.image,
            {
              width: config.diameter,
              height: config.diameter,
              borderRadius: config.diameter / 2,
            },
          ]}
          onError={() => setImageFailed(true)}
        />
      ) : initials ? (
        <Text
          style={[
            styles.initialsText,
            {
              fontSize: config.fontSize,
              color: fgColor,
            },
          ]}
        >
          {initials}
        </Text>
      ) : (
        <Ionicons
          name="person"
          size={Math.round(config.diameter * 0.5)}
          color={fgColor}
        />
      )}

      {/* Status indicator dot */}
      {status && (
        <View
          style={[
            styles.statusDot,
            {
              width: config.statusSize,
              height: config.statusSize,
              borderRadius: config.statusSize / 2,
              backgroundColor: STATUS_COLORS[status],
              right: 0,
              bottom: 0,
            },
          ]}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={name ? `Avatar for ${name}` : 'User avatar'}
      >
        {avatarContent}
      </TouchableOpacity>
    );
  }

  return avatarContent;
};

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    resizeMode: 'cover',
  },
  initialsText: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusDot: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
});

export default Avatar;
