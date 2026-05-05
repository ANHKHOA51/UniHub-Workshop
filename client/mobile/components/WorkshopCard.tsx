// ============================================================
// UniHub Workshop — Workshop Card Component
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Workshop } from '@/types';
import { Brand, Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { StatusBadge } from './ui/StatusBadge';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface WorkshopCardProps {
  workshop: Workshop;
  onPress: (workshop: Workshop) => void;
}

export function WorkshopCard({ workshop, onPress }: WorkshopCardProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const checkinProgress = workshop.registeredCount > 0
    ? Math.round((workshop.checkedInCount / workshop.registeredCount) * 100)
    : 0;

  const isUpcoming = true; // TODO: Compare with current time

  return (
    <TouchableOpacity
      onPress={() => onPress(workshop)}
      activeOpacity={0.85}
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderWidth: 1,
        },
        Shadows.md,
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.timeContainer}>
          <MaterialIcons name="schedule" size={14} color={theme.tint} />
          <Text style={[styles.timeText, { color: theme.tint }]}>
            {workshop.startTime}
          </Text>
        </View>
        <StatusBadge
          label={isUpcoming ? 'Sắp diễn ra' : 'Đang diễn ra'}
          variant={isUpcoming ? 'info' : 'success'}
          size="sm"
        />
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
        {workshop.title}
      </Text>

      {/* Info Row */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <MaterialIcons name="person" size={14} color={theme.textSecondary} />
          <Text style={[styles.infoText, { color: theme.textSecondary }]} numberOfLines={1}>
            {workshop.speaker}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <MaterialIcons name="room" size={14} color={theme.textSecondary} />
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            {workshop.room}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: theme.textTertiary }]}>
            Check-in
          </Text>
          <Text style={[styles.progressValue, { color: theme.text }]}>
            <Text style={{ color: Brand.success }}>{workshop.checkedInCount}</Text>
            /{workshop.registeredCount}
          </Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: theme.borderLight }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${checkinProgress}%`,
                backgroundColor: checkinProgress > 80 ? Brand.success : theme.tint,
              },
            ]}
          />
        </View>
      </View>

      {/* Arrow indicator */}
      <View style={styles.arrowRow}>
        <Text style={[styles.tapHint, { color: theme.textTertiary }]}>Nhấn để check-in</Text>
        <MaterialIcons name="chevron-right" size={20} color={theme.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  timeText: {
    ...Typography.captionBold,
  },
  title: {
    ...Typography.h3,
    marginBottom: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  infoText: {
    ...Typography.caption,
    flex: 1,
  },
  progressSection: {
    marginTop: Spacing.xs,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  progressLabel: {
    ...Typography.caption,
  },
  progressValue: {
    ...Typography.captionBold,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  arrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  tapHint: {
    ...Typography.caption,
  },
});
