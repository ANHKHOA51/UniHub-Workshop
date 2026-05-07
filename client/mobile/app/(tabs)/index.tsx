// ============================================================
// UniHub Workshop — Workshop List Screen (Tab: Home)
// Danh sách workshop hôm nay → Nhấn để vào chi tiết & check-in
// ============================================================

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '@/contexts/AuthContext';
import { Workshop } from '@/types';
import { WorkshopCard } from '@/components/WorkshopCard';
import { SyncIndicator } from '@/components/SyncIndicator';
import { Brand, Colors, Spacing, Typography, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as database from '@/services/database';
import * as api from '@/services/api';
import { USE_MOCK_DATA } from '@/constants/config';

export default function WorkshopListScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const { user } = useAuth();
  const router = useRouter();

  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const loadWorkshops = useCallback(async () => {
    try {
      // Fetch danh sách workshop thật từ Backend API
      const workshopsFromApi = await api.fetchWorkshops();
      // Lưu vào SQLite local để hỗ trợ offline
      await database.saveWorkshops(workshopsFromApi);

      // Luôn đọc từ local DB (offline-first)
      const data = await database.getWorkshops();
      setWorkshops(data);

      // Fetch và lưu danh sách đăng ký cho từng workshop để hỗ trợ quét QR offline
      for (const w of data) {
        try {
          const regs = await api.fetchWorkshopRegistrations(w.id);
          await database.saveRegistrations(regs);
        } catch (regError) {
          console.warn(`Failed to fetch registrations for workshop ${w.id}:`, regError);
        }
      }

      const pending = await database.countPendingSync();
      setPendingCount(pending);
    } catch (error) {
      // Nếu API lỗi, vẫn thử đọc dữ liệu offline cũ
      try {
        const offlineData = await database.getWorkshops();
        setWorkshops(offlineData);
      } catch {
        // Không có data offline nào
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWorkshops();
  }, []);

  // Reload định kỳ
  useEffect(() => {
    const interval = setInterval(() => {
      // Gọi lại loadWorkshops để vừa fetch API (nếu có mạng) vừa update local DB
      loadWorkshops();
    }, 15000);
    return () => clearInterval(interval);
  }, [loadWorkshops]);

  const handleWorkshopPress = (workshop: Workshop) => {
    router.push(`/workshop/${workshop.id}` as any);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadWorkshops();
  };

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Brand.primary} style={{ marginTop: 100 }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>
              Xin chào, {user?.fullName ?? 'Staff'}
            </Text>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              Workshops hôm nay
            </Text>
          </View>
          <SyncIndicator pendingCount={pendingCount} isSyncing={false} isOnline={true} />
        </View>
        <Text style={[styles.dateText, { color: theme.textTertiary }]}>{today}</Text>
      </View>

      {/* Workshop List */}
      {workshops.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="event-busy" size={64} color={theme.textTertiary} />
          <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>
            Không có workshop nào hôm nay
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textTertiary }]}>
            Kéo xuống để làm mới dữ liệu
          </Text>
        </View>
      ) : (
        <FlatList
          data={workshops}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <WorkshopCard
              workshop={item}
              onPress={handleWorkshopPress}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Brand.primary}
              colors={[Brand.primary]}
            />
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <View style={[styles.infoCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
                <MaterialIcons name="touch-app" size={20} color={Brand.accent} />
                <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                  Chọn workshop để xem chi tiết và bắt đầu quét QR check-in
                </Text>
              </View>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    ...Typography.caption,
    marginBottom: Spacing.xs,
  },
  headerTitle: {
    ...Typography.h1,
  },
  dateText: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['5xl'],
  },
  listHeader: {
    marginBottom: Spacing.md,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  infoText: {
    ...Typography.caption,
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['3xl'],
  },
  emptyTitle: {
    ...Typography.h3,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.body,
    textAlign: 'center',
  },
});
