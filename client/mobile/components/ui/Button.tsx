// ============================================================
// UniHub Workshop — Button Component
// Premium button with gradient, loading state, haptic feedback
// ============================================================

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Brand, Radius, Spacing, Typography, Shadows } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
}: ButtonProps) {
  const handlePress = () => {
    if (loading || disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const buttonStyles: ViewStyle[] = [
    styles.base,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    (disabled || loading) && styles.disabled,
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`textSize_${size}`],
    styles[`textVariant_${variant}`],
    (disabled || loading) && styles.textDisabled,
  ].filter(Boolean) as TextStyle[];

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={buttonStyles}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'ghost' || variant === 'secondary' ? Brand.primary : '#fff'}
        />
      ) : (
        <>
          {icon}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    ...Shadows.sm,
  },

  // Sizes
  size_sm: { height: 36, paddingHorizontal: Spacing.lg },
  size_md: { height: 48, paddingHorizontal: Spacing.xl },
  size_lg: { height: 56, paddingHorizontal: Spacing['2xl'] },

  // Variants
  variant_primary: { backgroundColor: Brand.primary },
  variant_secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Brand.primary,
  },
  variant_danger: { backgroundColor: Brand.error },
  variant_ghost: { backgroundColor: 'transparent' },

  // Disabled
  disabled: { opacity: 0.5 },

  // Text
  text: {
    ...Typography.bodyBold,
    textAlign: 'center',
  },
  textSize_sm: { fontSize: 14 },
  textSize_md: { fontSize: 16 },
  textSize_lg: { fontSize: 18 },

  textVariant_primary: { color: '#FFFFFF' },
  textVariant_secondary: { color: Brand.primary },
  textVariant_danger: { color: '#FFFFFF' },
  textVariant_ghost: { color: Brand.primary },

  textDisabled: { opacity: 0.7 },
});
