// ============================================================
// UniHub Workshop — App Configuration
// ============================================================

/**
 * API base URL — thay đổi khi deploy production.
 * Khi dùng Expo Go trên thiết bị thật, cần dùng IP LAN của máy tính
 * thay vì localhost.
 */
export const API_BASE_URL = __DEV__
  ? 'https://cavalry-manifesto-monsoon.ngrok-free.dev/api' // Đổi IP này theo mạng LAN của bạn
  : 'https://api.unihub-workshop.com/api';

/**
 * Ed25519 Public Key (Base64 encoded)
 * Dùng để xác minh chữ ký số trên mã QR.
 * Key này được sinh ra bởi Backend và nhúng vào app.
 *
 * ⚠️ LƯU Ý: Đây là PUBLIC key, an toàn khi nhúng vào source code.
 * Private key chỉ nằm trên server.
 *
 * TODO: Thay bằng public key thật khi Backend deploy.
 */
export const ED25519_PUBLIC_KEY ="O096wpFX9vag8LfA093E8EsNMp9LqEDWH46Mvtib8zg=";

/**
 * Background sync interval (milliseconds)
 * Worker kiểm tra pending records mỗi 30 giây
 */
export const SYNC_INTERVAL_MS = 30_000;

/**
 * Chunk size cho mỗi lần sync
 */
export const SYNC_CHUNK_SIZE = 50;

/**
 * Có sử dụng mock data không (khi chưa có Backend API)
 */
export const USE_MOCK_DATA = false;
