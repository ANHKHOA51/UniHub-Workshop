// ============================================================
// UniHub Workshop — Workshop Detail Screen
// Chi tiết workshop: Danh sách check-in + Modal Scanner riêng
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { Brand, Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CheckInResult, Registration, Workshop } from '@/types';
import { verifyQrCode } from '@/services/qr-verify';
import * as database from '@/services/database';
import { ScanResult } from '@/components/ScanResult';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SyncIndicator } from '@/components/SyncIndicator';
import { onSyncStatusChange } from '@/services/sync-worker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCAN_AREA_SIZE = SCREEN_WIDTH * 0.7;

export default function WorkshopDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [checkins, setCheckins] = useState<Registration[]>([]);
  const [scanResult, setScanResult] = useState<CheckInResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [pendingCount, setPendingCount] = useState(0);

  const scanLineAnim = useRef(new Animated.Value(0)).current;

  const loadData = useCallback(async () => {
    if (!id) return;
    const workshops = await database.getWorkshops();
    let found = workshops.find((w) => String(w.id) === String(id)) ?? null;

    if (found) {
      // Ép lấy số liệu tổng hợp trực tiếp từ bảng registrations để chính xác tuyệt đối
      const stats = await database.getWorkshopStats(String(id));
      found = {
        ...found,
        registeredCount: Math.max(found.registeredCount, stats.registered),
        checkedInCount: Math.max(found.checkedInCount, stats.checkedIn),
      };
    }
    setWorkshop(found);

    // Load tất cả registrations đã check-in để hiển thị danh sách
    const recent = await database.getRecentCheckins(String(id), 100);
    setCheckins(recent);

    const pending = await database.countPendingSync();
    setPendingCount(pending);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
  // Đăng ký lắng nghe
  const unsubscribe = onSyncStatusChange((status) => {
    // Nếu vừa sync xong (isSyncing chuyển từ true sang false)
    // hoặc đơn giản là mỗi lần Worker chạy xong một chu kỳ
    if (!status.isSyncing) {
      loadData(); 
    }
  });
  // Quan trọng: Hủy lắng nghe khi thoát màn hình để tránh leak bộ nhớ
  return () => unsubscribe();
}, [loadData]);

  useEffect(() => {
    if (isScannerOpen) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [isScannerOpen]);

  const handleOpenScanner = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }
    setIsScannerOpen(true);
  };

  const handleCloseScanner = () => {
    setIsScannerOpen(false);
    setScanResult(null);
  };

  const handleBarCodeScanned = useCallback(
    async (result: BarcodeScanningResult) => {
      if (isProcessing || scanResult || !workshop) return;
      setIsProcessing(true);

      const qrData = result.data;
      const timestamp = new Date().toISOString();

      try {
        const verifyResult = await verifyQrCode(qrData);
        console.log("🔍 QR Payload nhận được:", verifyResult.registrationId);
        if (!verifyResult.isValid || !verifyResult.registrationId) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setScanResult({
            status: 'INVALID_QR',
            message: verifyResult.error || 'Mã QR không hợp lệ',
            timestamp,
          });
          return;
        }

        const registrationId = verifyResult.registrationId;
        const workshopIdStr = String(workshop.id);
        const allRegs = await database.getRecentCheckins(workshopIdStr, 100);
        console.log("📋 Danh sách ID trong máy:", allRegs.map(r => r.id));
        let registration = await database.findRegistrationForWorkshop(
          registrationId,
          workshopIdStr
        );

        if (!registration) {
          const anyReg = await database.findRegistration(registrationId);
          if (anyReg) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setScanResult({
              status: 'WRONG_WORKSHOP',
              registration: anyReg,
              message: 'Vé này thuộc workshop khác',
              timestamp,
            });
            return;
          }

          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setScanResult({
            status: 'NOT_FOUND',
            message: 'Không tìm thấy vé trong danh sách. Kết nối mạng để cập nhật.',
            timestamp,
          });
          return;
        }

        if (registration.checkedInAt) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          const d = new Date(registration.checkedInAt);
          const checkedTime = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
          setScanResult({
            status: 'ALREADY_CHECKED_IN',
            registration,
            message: `Vé đã được sử dụng lúc ${checkedTime}`,
            timestamp,
          });
          return;
        }

        await database.markCheckedIn(registrationId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        registration = { ...registration, checkedInAt: timestamp };

        setScanResult({
          status: 'SUCCESS',
          registration,
          message: 'Check-in thành công!',
          timestamp,
        });

        setTimeout(() => loadData(), 500);
      } catch (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setScanResult({
          status: 'INVALID_QR',
          message: `Lỗi: ${error instanceof Error ? error.message : 'Không xác định'}`,
          timestamp,
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, scanResult, workshop, loadData]
  );

  const handleDismissResult = () => {
    setScanResult(null);
  };

  const renderCheckinItem = ({ item }: { item: Registration }) => (
    <View style={[styles.checkinItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.checkinAvatar, { backgroundColor: theme.tint }]}>
        <Text style={[styles.checkinAvatarText, { color: colorScheme === 'dark' ? '#000000' : '#FFFFFF' }]}>
          {item.studentName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.checkinInfo}>
        <Text style={[styles.checkinName, { color: theme.text }]} numberOfLines={1}>
          {item.studentName}
        </Text>
        <Text style={[styles.checkinTime, { color: theme.textTertiary }]}>
          {item.checkedInAt
            ? (() => {
                const d = new Date(item.checkedInAt);
                return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
              })()
            : '—'}
        </Text>
      </View>
      <View style={styles.checkinStatus}>
        {item.pendingSync ? (
          <StatusBadge label="Chờ sync" variant="warning" size="sm" />
        ) : (
          <StatusBadge label="Đã sync" variant="success" size="sm" />
        )}
      </View>
    </View>
  );

  if (!workshop) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
        <Text style={[Typography.body, { color: theme.textSecondary, textAlign: 'center', marginTop: 100 }]}>
          Đang tải...
        </Text>
      </View>
    );
  }

  const checkinProgress = workshop.registeredCount > 0
    ? Math.round((workshop.checkedInCount / workshop.registeredCount) * 100)
    : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
            {workshop.title}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textTertiary }]}>
            {workshop.room} • {workshop.startTime}
          </Text>
        </View>
        <SyncIndicator pendingCount={pendingCount} isSyncing={false} isOnline={true} />
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.statValue, { color: Brand.success }]}>
            {workshop.checkedInCount}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Đã check-in</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {workshop.registeredCount}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Đã đăng ký</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {checkinProgress}%
          </Text>
          <Text style={[styles.statLabel, { color: theme.textTertiary }]}>Tỉ lệ</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
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

      <View style={styles.listSection}>
        <View style={styles.listHeader}>
          <Text style={[styles.listTitle, { color: theme.text }]}>
            Danh sách check-in
          </Text>
          <Text style={[styles.listCount, { color: theme.textTertiary }]}>
            {checkins.length} người
          </Text>
        </View>

        {checkins.length === 0 ? (
          <View style={styles.emptyList}>
            <MaterialIcons name="how-to-reg" size={40} color={theme.textTertiary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Chưa có sinh viên nào check-in
            </Text>
            <Text style={[styles.emptyHint, { color: theme.textTertiary }]}>
              Nhấn nút quét QR để bắt đầu
            </Text>
          </View>
        ) : (
          <FlatList
            data={checkins}
            keyExtractor={(item) => item.id}
            renderItem={renderCheckinItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      <TouchableOpacity
        onPress={handleOpenScanner}
        activeOpacity={0.85}
        style={[styles.fabButton, { backgroundColor: theme.tint, bottom: insets.bottom + Spacing.lg }]}
      >
        <MaterialIcons name="qr-code-scanner" size={28} color={colorScheme === 'dark' ? '#000000' : '#FFFFFF'} />
      </TouchableOpacity>

      <Modal
        visible={isScannerOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={handleCloseScanner}
      >
        <View style={styles.modalContainer}>
          {permission?.granted ? (
            <View style={StyleSheet.absoluteFillObject}>
              <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={scanResult ? undefined : handleBarCodeScanned}
              />

              <View style={[StyleSheet.absoluteFillObject, { zIndex: 5 }]}>
                <View style={[styles.modalHeader, { paddingTop: insets.top + Spacing.sm }]}>
                  <TouchableOpacity onPress={handleCloseScanner} style={styles.modalCloseButton}>
                    <MaterialIcons name="close" size={28} color="#FFFFFF" />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Quét QR</Text>
                  <View style={{ width: 44 }} />
                </View>

                <View style={styles.modalScanOverlay}>
                  <View style={styles.modalScanAreaWrapper}>
                    <View style={[styles.corner, styles.cornerTL]} />
                    <View style={[styles.corner, styles.cornerTR]} />
                    <View style={[styles.corner, styles.cornerBL]} />
                    <View style={[styles.corner, styles.cornerBR]} />

                    <Animated.View
                      style={[
                        styles.scanLine,
                        {
                          transform: [
                            {
                              translateY: scanLineAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, SCAN_AREA_SIZE - 4],
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.modalScanHint}>Đưa mã QR vào khung hình để quét</Text>
                </View>

                {scanResult ? (
                  <ScanResult result={scanResult} onDismiss={handleDismissResult} />
                ) : null}
              </View>
            </View>
          ) : (
            <View style={[styles.modalContainer, { alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={{ color: '#FFF', marginBottom: Spacing.lg }}>Không có quyền truy cập camera</Text>
              <TouchableOpacity onPress={handleCloseScanner} style={[styles.scanButtonFallback, { backgroundColor: theme.tint }]}>
                <Text style={[styles.scanButtonText, { color: colorScheme === 'dark' ? '#000000' : '#FFFFFF' }]}>Đóng</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    ...Typography.h3,
    marginBottom: 2,
  },
  headerSubtitle: {
    ...Typography.caption,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    ...Typography.caption,
    fontSize: 11,
  },
  progressContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
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
  listSection: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  listTitle: {
    ...Typography.h3,
  },
  listCount: {
    ...Typography.captionBold,
  },
  listContent: {
    paddingBottom: 100, // Make room for FAB
  },
  checkinItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  checkinAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkinAvatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  checkinInfo: {
    flex: 1,
  },
  checkinName: {
    ...Typography.bodyBold,
    marginBottom: 2,
  },
  checkinTime: {
    ...Typography.caption,
  },
  checkinStatus: {},
  emptyList: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing['4xl'],
  },
  emptyText: {
    ...Typography.body,
  },
  emptyHint: {
    ...Typography.caption,
  },
  fabButton: {
    position: 'absolute',
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
    elevation: 8,
    zIndex: 10,
  },
  scanButtonFallback: {
    paddingHorizontal: 30,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
  },
  scanButtonText: {
    ...Typography.bodyBold,
    color: '#FFFFFF',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCloseButton: {
    padding: Spacing.xs,
  },
  modalTitle: {
    ...Typography.h2,
    color: '#FFFFFF',
  },
  modalScanOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalScanAreaWrapper: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: 'relative',
    marginBottom: Spacing.xl,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#FFFFFF', /* Sáng rõ trên nền camera */
    borderWidth: 4,
  },
  cornerTL: {
    top: 0, left: 0,
    borderRightWidth: 0, borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0, right: 0,
    borderLeftWidth: 0, borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0, left: 0,
    borderRightWidth: 0, borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0, right: 0,
    borderLeftWidth: 0, borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  scanLine: {
    width: '100%',
    height: 3,
    backgroundColor: '#FFFFFF', /* Sáng rõ trên nền camera */
    opacity: 0.9,
    ...Shadows.glow('#FFFFFF'),
  },
  modalScanHint: {
    ...Typography.body,
    color: '#FFFFFF',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
});
