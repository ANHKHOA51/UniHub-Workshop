// ============================================================
// UniHub Workshop — Scan Result Overlay Component
// Hiển thị kết quả sau khi quét QR
// ============================================================

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { CheckInResult } from '@/types';
import { Brand, Radius, Spacing, Typography, Shadows } from '@/constants/theme';

interface ScanResultProps {
  result: CheckInResult;
  onDismiss: () => void;
  autoDismissMs?: number;
}

const statusConfig: Record<
  string,
  { icon: keyof typeof MaterialIcons.glyphMap; color: string; bg: string; label: string }
> = {
  SUCCESS: {
    icon: 'check-circle',
    color: Brand.success,
    bg: Brand.successBg,
    label: 'CHECK-IN THÀNH CÔNG',
  },
  ALREADY_CHECKED_IN: {
    icon: 'error',
    color: Brand.warning,
    bg: Brand.warningBg,
    label: 'ĐÃ CHECK-IN',
  },
  INVALID_QR: {
    icon: 'cancel',
    color: Brand.error,
    bg: Brand.errorBg,
    label: 'MÃ QR KHÔNG HỢP LỆ',
  },
  NOT_FOUND: {
    icon: 'help',
    color: Brand.error,
    bg: Brand.errorBg,
    label: 'KHÔNG TÌM THẤY VÉ',
  },
  WRONG_WORKSHOP: {
    icon: 'swap-horiz',
    color: Brand.warning,
    bg: Brand.warningBg,
    label: 'SAI WORKSHOP',
  },
};

export function ScanResult({ result, onDismiss, autoDismissMs = 3000 }: ScanResultProps) {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const config = statusConfig[result.status] || statusConfig.INVALID_QR;

  useEffect(() => {
    // Slide in
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => onDismiss());
    }, autoDismissMs);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={[styles.card, { borderColor: config.color }, Shadows.lg]}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: config.bg }]}>
          <MaterialIcons name={config.icon} size={48} color={config.color} />
        </View>

        {/* Status label */}
        <Text style={[styles.statusLabel, { color: config.color }]}>{config.label}</Text>

        {/* Student name (if available) */}
        {result.registration && (
          <Text style={styles.studentName}>{result.registration.studentName}</Text>
        )}

        {/* Message */}
        <Text style={styles.message}>{result.message}</Text>

        {/* Timestamp */}
        <Text style={styles.timestamp}>
          {new Date(result.timestamp).toLocaleTimeString('vi-VN')}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    zIndex: 100,
  },
  card: {
    backgroundColor: '#1E1B3A',
    borderRadius: Radius.xl,
    padding: Spacing['2xl'],
    alignItems: 'center',
    borderWidth: 2,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  statusLabel: {
    ...Typography.label,
    marginBottom: Spacing.xs,
  },
  studentName: {
    ...Typography.h2,
    color: '#F1F5F9',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  message: {
    ...Typography.body,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  timestamp: {
    ...Typography.caption,
    color: '#64748B',
  },
});
