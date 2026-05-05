// ============================================================
// UniHub Workshop — Background Sync Worker
// Đồng bộ check-in records lên server theo batch (chunked)
// ============================================================

import { getPendingSyncRecords, clearPendingSync } from './database';
import { SYNC_CHUNK_SIZE, API_BASE_URL, USE_MOCK_DATA } from '@/constants/config';
import { SyncResponse } from '@/types';
import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';

let syncTimer: ReturnType<typeof setInterval> | null = null;
let isSyncing = false;

/** Callback khi trạng thái sync thay đổi */
type SyncStatusCallback = (status: {
  isSyncing: boolean;
  lastSyncTime: string | null;
  pendingCount: number;
  error: string | null;
}) => void;

let statusCallback: SyncStatusCallback | null = null;

/** Đăng ký callback để nhận cập nhật trạng thái */
export function onSyncStatusChange(callback: SyncStatusCallback): () => void {
  statusCallback = callback;
  return () => {
    statusCallback = null;
  };
}

/** Thực hiện sync 1 lần */
export async function syncNow(): Promise<void> {
  if (isSyncing) return;

  // Kiểm tra mạng
  const netState = await NetInfo.fetch();
  if (!netState.isConnected) {
    statusCallback?.({
      isSyncing: false,
      lastSyncTime: null,
      pendingCount: -1, // -1 = không check được
      error: 'Không có kết nối mạng',
    });
    return;
  }

  isSyncing = true;
  statusCallback?.({
    isSyncing: true,
    lastSyncTime: null,
    pendingCount: -1,
    error: null,
  });

  try {
    const pendingRecords = await getPendingSyncRecords();

    if (pendingRecords.length === 0) {
      statusCallback?.({
        isSyncing: false,
        lastSyncTime: new Date().toISOString(),
        pendingCount: 0,
        error: null,
      });
      isSyncing = false;
      return;
    }

    // Chia thành chunks
    for (let i = 0; i < pendingRecords.length; i += SYNC_CHUNK_SIZE) {
      const chunk = pendingRecords.slice(i, i + SYNC_CHUNK_SIZE);

      if (USE_MOCK_DATA) {
        // Mock: giả lập sync thành công
        await new Promise((r) => setTimeout(r, 500));
        for (const record of chunk) {
          await clearPendingSync(record.id);
        }
        continue;
      }

      // Real API call
      try {
        const token = await SecureStore.getItemAsync('unihub_access_token');
        const response = await fetch(`${API_BASE_URL}/checkins/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            records: chunk.map((r) => ({
              registration_id: r.id,
              checked_in: r.checkedInAt,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error(`Server trả về lỗi: ${response.status}`);
        }

        const data: SyncResponse = await response.json();

        for (const result of data.results) {
          if (result.status === 'success' || result.status === 'conflict') {
            await clearPendingSync(result.registration_id);
          }
        }
      } catch (error) {
        // Mất mạng giữa chừng → dừng vòng lặp, giữ pending_sync
        console.warn('[Sync] Chunk failed, stopping:', error);
        break;
      }
    }

    // Đếm lại pending
    const remaining = await getPendingSyncRecords();
    statusCallback?.({
      isSyncing: false,
      lastSyncTime: new Date().toISOString(),
      pendingCount: remaining.length,
      error: null,
    });
  } catch (error) {
    statusCallback?.({
      isSyncing: false,
      lastSyncTime: null,
      pendingCount: -1,
      error: error instanceof Error ? error.message : 'Lỗi không xác định',
    });
  } finally {
    isSyncing = false;
  }
}

/** Bắt đầu background sync timer */
export function startSyncWorker(intervalMs: number = 30_000): void {
  if (syncTimer) return; // Đã chạy rồi

  // Sync ngay lần đầu
  syncNow();

  // Lặp lại mỗi intervalMs
  syncTimer = setInterval(() => {
    syncNow();
  }, intervalMs);

  console.log(`[Sync] Worker started, interval: ${intervalMs}ms`);
}

/** Dừng background sync */
export function stopSyncWorker(): void {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
    console.log('[Sync] Worker stopped');
  }
}
