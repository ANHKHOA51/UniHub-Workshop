// ============================================================
// UniHub Workshop — Sync Indicator Component
// Hiển thị trạng thái đồng bộ ở góc màn hình
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Brand, Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SyncIndicatorProps {
  pendingCount: number;
  isSyncing: boolean;
  isOnline: boolean;
}

export function SyncIndicator({ pendingCount, isSyncing, isOnline }: SyncIndicatorProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  if (pendingCount === 0 && !isSyncing && isOnline) {
    return null; // Không cần hiển thị khi mọi thứ đã sync
  }

  const getConfig = () => {
    if (!isOnline) {
      return {
        icon: 'cloud-off' as const,
        color: Brand.warning,
        bg: Brand.warningBg,
        label: 'Offline',
      };
    }
    if (isSyncing) {
      return {
        icon: 'cloud-upload' as const,
        color: Brand.info,
        bg: Brand.infoBg,
        label: 'Đang đồng bộ...',
      };
    }
    if (pendingCount > 0) {
      return {
        icon: 'cloud-queue' as const,
        color: theme.tint,
        bg: theme.border,
        label: `${pendingCount} chờ đồng bộ`,
      };
    }
    return {
      icon: 'cloud-done' as const,
      color: Brand.success,
      bg: Brand.successBg,
      label: 'Đã đồng bộ',
    };
  };

  const config = getConfig();

  return (
    <View style={[styles.container, { backgroundColor: config.bg }]}>
      <MaterialIcons name={config.icon} size={14} color={config.color} />
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
  },
  label: {
    ...Typography.captionBold,
    fontSize: 11,
  },
});
