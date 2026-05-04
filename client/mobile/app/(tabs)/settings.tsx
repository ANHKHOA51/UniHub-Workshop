// ============================================================
// UniHub Workshop — Settings Screen (Tab: Settings)
// Trạng thái sync, thống kê, và đăng xuất
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import NetInfo from '@react-native-community/netinfo';
import { Brand, Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import * as database from '@/services/database';
import { syncNow } from '@/services/sync-worker';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const { user, logout } = useAuth();

  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  // Kiểm tra mạng & pending records
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    const checkPending = async () => {
      const count = await database.countPendingSync();
      setPendingCount(count);
    };

    checkPending();
    const interval = setInterval(checkPending, 10000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleForceSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      await syncNow();
      const count = await database.countPendingSync();
      setPendingCount(count);
      setLastSync(new Date().toLocaleTimeString('vi-VN'));
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể đồng bộ. Vui lòng thử lại.');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const handleLogout = () => {
    if (pendingCount > 0) {
      Alert.alert(
        'Cảnh báo',
        `Còn ${pendingCount} bản ghi chưa đồng bộ. Nếu đăng xuất, dữ liệu này có thể bị mất.\n\nBạn có chắc chắn?`,
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng xuất', style: 'destructive', onPress: logout },
        ]
      );
    } else {
      Alert.alert(
        'Đăng xuất',
        'Bạn có chắc chắn muốn đăng xuất?',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng xuất', onPress: logout },
        ]
      );
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.xl }]}
    >
      {/* Header */}
      <Text style={[styles.title, { color: theme.text }]}>Cài đặt</Text>

      {/* User Info Card */}
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.userAvatar}>
          <MaterialIcons name="person" size={28} color={Brand.primary} />
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: theme.text }]}>{user?.fullName}</Text>
          <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user?.email}</Text>
          <StatusBadge label="STAFF" variant="info" size="sm" />
        </View>
      </View>

      {/* Sync Status Card */}
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>ĐỒNG BỘ DỮ LIỆU</Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {/* Network status */}
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <MaterialIcons
              name={isOnline ? 'wifi' : 'wifi-off'}
              size={22}
              color={isOnline ? Brand.success : Brand.error}
            />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Kết nối mạng</Text>
          </View>
          <StatusBadge
            label={isOnline ? 'Online' : 'Offline'}
            variant={isOnline ? 'success' : 'error'}
            size="sm"
          />
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        {/* Pending sync */}
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <MaterialIcons name="cloud-upload" size={22} color={Brand.accent} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Chờ đồng bộ</Text>
          </View>
          <View style={styles.pendingBadge}>
            <Text style={[styles.pendingCount, {
              color: pendingCount > 0 ? Brand.warning : Brand.success,
            }]}>
              {pendingCount}
            </Text>
            <Text style={[styles.pendingUnit, { color: theme.textTertiary }]}>bản ghi</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        {/* Last sync time */}
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <MaterialIcons name="schedule" size={22} color={theme.textSecondary} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Lần sync gần nhất</Text>
          </View>
          <Text style={[styles.settingValue, { color: theme.textSecondary }]}>
            {lastSync || 'Chưa sync'}
          </Text>
        </View>

        {/* Force sync button */}
        <Button
          title="Đồng bộ ngay"
          onPress={handleForceSync}
          variant="secondary"
          loading={isSyncing}
          disabled={!isOnline || pendingCount === 0}
          icon={<MaterialIcons name="sync" size={18} color={Brand.primary} />}
          style={styles.syncButton}
        />
      </View>

      {/* About section */}
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>THÔNG TIN</Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <MaterialIcons name="info" size={22} color={theme.textSecondary} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Phiên bản</Text>
          </View>
          <Text style={[styles.settingValue, { color: theme.textSecondary }]}>1.0.0</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <MaterialIcons name="storage" size={22} color={theme.textSecondary} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Database</Text>
          </View>
          <Text style={[styles.settingValue, { color: theme.textSecondary }]}>SQLite (Local)</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <MaterialIcons name="security" size={22} color={theme.textSecondary} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Xác minh QR</Text>
          </View>
          <Text style={[styles.settingValue, { color: theme.textSecondary }]}>Ed25519</Text>
        </View>
      </View>

      {/* Logout */}
      <Button
        title="Đăng xuất"
        onPress={handleLogout}
        variant="danger"
        size="lg"
        icon={<MaterialIcons name="logout" size={20} color="#fff" />}
        style={styles.logoutButton}
      />

      <Text style={[styles.footerText, { color: theme.textTertiary }]}>
        UniHub Workshop © 2026
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['5xl'],
  },
  title: {
    ...Typography.h1,
    marginBottom: Spacing['2xl'],
  },
  sectionTitle: {
    ...Typography.label,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: Spacing['2xl'],
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    ...Shadows.sm,
  },
  // User info
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  userInfo: {
    gap: Spacing.xs,
  },
  userName: {
    ...Typography.h3,
  },
  userEmail: {
    ...Typography.caption,
    marginBottom: Spacing.xs,
  },
  // Setting rows
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingLabel: {
    ...Typography.body,
  },
  settingValue: {
    ...Typography.bodyBold,
  },
  divider: {
    height: 1,
    marginHorizontal: -Spacing.lg,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
  },
  pendingCount: {
    fontSize: 20,
    fontWeight: '700',
  },
  pendingUnit: {
    ...Typography.caption,
  },
  syncButton: {
    marginTop: Spacing.lg,
  },
  logoutButton: {
    marginTop: Spacing['3xl'],
  },
  footerText: {
    ...Typography.caption,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
