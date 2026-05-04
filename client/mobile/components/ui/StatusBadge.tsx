// ============================================================
// UniHub Workshop — Status Badge Component
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Brand, Radius, Spacing, Typography } from '@/constants/theme';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: Brand.successBg, text: Brand.success },
  error: { bg: Brand.errorBg, text: Brand.error },
  warning: { bg: Brand.warningBg, text: Brand.warning },
  info: { bg: Brand.infoBg, text: Brand.info },
  neutral: { bg: 'rgba(148, 163, 184, 0.12)', text: '#94A3B8' },
};

export function StatusBadge({ label, variant = 'neutral', size = 'md' }: StatusBadgeProps) {
  const colors = variantColors[variant];

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, size === 'sm' && styles.badgeSm]}>
      <View style={[styles.dot, { backgroundColor: colors.text }]} />
      <Text style={[styles.text, { color: colors.text }, size === 'sm' && styles.textSm]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    gap: Spacing.xs + 2,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    ...Typography.captionBold,
    textTransform: 'uppercase',
  },
  textSm: {
    fontSize: 10,
  },
});
