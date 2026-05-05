// ============================================================
// UniHub Workshop — Mobile App Type Definitions
// ============================================================

/** Vai trò người dùng trong hệ thống */
export type UserRole = 'STUDENT' | 'ADMIN' | 'STAFF';

/** Thông tin người dùng từ JWT */
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

/** Thông tin JWT token response */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** Workshop information */
export interface Workshop {
  id: string;
  title: string;
  description: string;
  speaker: string;
  room: string;
  date: string; // ISO date string
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  maxSlots: number;
  registeredCount: number;
  checkedInCount: number;
}

/** Registration record (synced to local DB) */
export interface Registration {
  id: string; // registration_id (UUID)
  userId: string;
  workshopId: string;
  studentName: string;
  studentEmail: string;
  checkedInAt: string | null; // ISO datetime or null
  pendingSync: boolean;
}

/** Check-in result status */
export type CheckInStatus =
  | 'SUCCESS'
  | 'ALREADY_CHECKED_IN'
  | 'INVALID_QR'
  | 'NOT_FOUND'
  | 'WRONG_WORKSHOP';

/** Check-in result after scanning */
export interface CheckInResult {
  status: CheckInStatus;
  registration?: Registration;
  message: string;
  timestamp: string;
}

/** Sync record for background worker */
export interface SyncRecord {
  registrationId: string;
  checkedInAt: string;
}

/** Sync batch API response */
export interface SyncResponse {
  results: Array<{
    registration_id: string;
    status: 'success' | 'conflict';
    reason?: string;
  }>;
}

/** App network status */
export type NetworkStatus = 'online' | 'offline' | 'unknown';

/** Scan history entry (for UI display) */
export interface ScanHistoryEntry {
  id: string;
  registrationId: string;
  studentName: string;
  workshopTitle: string;
  status: CheckInStatus;
  scannedAt: string;
  synced: boolean;
}
