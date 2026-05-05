// ============================================================
// UniHub Workshop — Database Service (SQLite)
// Lưu trữ offline cho registrations và check-in records
// ============================================================

import * as SQLite from 'expo-sqlite';
import { Registration, Workshop } from '@/types';
import { USE_MOCK_DATA } from '@/constants/config';

let db: SQLite.SQLiteDatabase | null = null;

/** Mở database connection */
async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('unihub_checkin.db');
    await initTables();
  }
  return db;
}

/** Khởi tạo bảng */
async function initTables(): Promise<void> {
  if (!db) return;

  // Xóa db cũ (reset)
  await db.execAsync(`
    DROP TABLE IF EXISTS registrations;
    DROP TABLE IF EXISTS workshops;
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS workshops (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      time TEXT,
      speaker TEXT,
      floor_plan TEXT,
      location TEXT,
      price REAL DEFAULT 0,
      capacity INTEGER DEFAULT 0,
      registered_count INTEGER DEFAULT 0,
      checked_in_count INTEGER DEFAULT 0,
      summary TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS registrations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      workshop_id TEXT NOT NULL,
      student_name TEXT,
      student_email TEXT,
      status TEXT DEFAULT 'pending',
      qr_code TEXT,
      checked_in TEXT,
      pending_sync INTEGER DEFAULT 0,
      FOREIGN KEY (workshop_id) REFERENCES workshops(id)
    );

    CREATE INDEX IF NOT EXISTS idx_reg_workshop ON registrations(workshop_id);
    CREATE INDEX IF NOT EXISTS idx_reg_pending ON registrations(pending_sync);
  `);
}

// ─── Workshop Operations ────────────────────────────────────

/** Lưu danh sách workshops (upsert) */
export async function saveWorkshops(workshops: Workshop[]): Promise<void> {
  const database = await getDb();

  for (const w of workshops) {
    const time = w.date && w.startTime ? `${w.date}T${w.startTime}:00.000Z` : null;

    await database.runAsync(
      `INSERT OR REPLACE INTO workshops (id, title, description, time, speaker, location, capacity, registered_count, checked_in_count, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [w.id, w.title, w.description, time, w.speaker, w.room, w.maxSlots, w.registeredCount, w.checkedInCount]
    );
  }
}

/** Lấy danh sách workshops */
export async function getWorkshops(): Promise<Workshop[]> {
  const database = await getDb();

  const rows = await database.getAllAsync<{
    id: string;
    title: string;
    description: string;
    time: string | null;
    speaker: string;
    location: string;
    capacity: number;
    registered_count: number;
    checked_in_count: number;
  }>('SELECT * FROM workshops ORDER BY time ASC');

  return rows.map((row) => {
    let dateStr = '';
    let startTimeStr = '';
    if (row.time) {
      const d = new Date(row.time);
      if (!isNaN(d.getTime())) {
        dateStr = d.toISOString().split('T')[0];
        const hours = d.getUTCHours().toString().padStart(2, '0');
        const minutes = d.getUTCMinutes().toString().padStart(2, '0');
        startTimeStr = `${hours}:${minutes}`;
      }
    }

    return {
      id: String(row.id),
      title: row.title,
      description: row.description,
      speaker: row.speaker,
      room: row.location,
      date: dateStr,
      startTime: startTimeStr,
      endTime: '',
      maxSlots: row.capacity,
      registeredCount: row.registered_count,
      checkedInCount: row.checked_in_count,
    };
  });
}

// ─── Registration Operations ────────────────────────────────

/** Lưu danh sách registrations cho 1 workshop (upsert) */
export async function saveRegistrations(registrations: Registration[]): Promise<void> {
  const database = await getDb();

  for (const r of registrations) {
    await database.runAsync(
      `INSERT OR REPLACE INTO registrations (id, user_id, workshop_id, student_name, student_email, checked_in, pending_sync)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [r.id, r.userId || '', r.workshopId, r.studentName, r.studentEmail, r.checkedInAt, r.pendingSync ? 1 : 0]
    );
  }
}

/** Tìm registration theo ID */
export async function findRegistration(registrationId: string): Promise<Registration | null> {
  const database = await getDb();

  const row = await database.getFirstAsync<{
    id: string;
    user_id: string;
    workshop_id: string;
    student_name: string;
    student_email: string;
    checked_in: string | null;
    pending_sync: number;
  }>('SELECT * FROM registrations WHERE id = ?', [registrationId]);

  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    workshopId: row.workshop_id,
    studentName: row.student_name,
    studentEmail: row.student_email,
    checkedInAt: row.checked_in,
    pendingSync: row.pending_sync === 1,
  };
}

/** Tìm registration theo ID và workshop ID */
export async function findRegistrationForWorkshop(
  registrationId: string,
  workshopId: string
): Promise<Registration | null> {
  const database = await getDb();

  const row = await database.getFirstAsync<{
    id: string;
    user_id: string;
    workshop_id: string;
    student_name: string;
    student_email: string;
    checked_in: string | null;
    pending_sync: number;
  }>('SELECT * FROM registrations WHERE id = ? AND workshop_id = ?', [registrationId, workshopId]);

  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    workshopId: row.workshop_id,
    studentName: row.student_name,
    studentEmail: row.student_email,
    checkedInAt: row.checked_in,
    pendingSync: row.pending_sync === 1,
  };
}

/** Đánh dấu check-in (ghi vào Local DB) */
export async function markCheckedIn(registrationId: string): Promise<void> {
  const database = await getDb();
  const now = new Date().toISOString();

  await database.runAsync(
    'UPDATE registrations SET checked_in = ?, pending_sync = 1 WHERE id = ?',
    [now, registrationId]
  );
}

/** Lấy tất cả bản ghi chưa đồng bộ */
export async function getPendingSyncRecords(): Promise<Registration[]> {
  const database = await getDb();

  const rows = await database.getAllAsync<{
    id: string;
    user_id: string;
    workshop_id: string;
    student_name: string;
    student_email: string;
    checked_in: string | null;
    pending_sync: number;
  }>('SELECT * FROM registrations WHERE pending_sync = 1 AND checked_in IS NOT NULL');

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    workshopId: row.workshop_id,
    studentName: row.student_name,
    studentEmail: row.student_email,
    checkedInAt: row.checked_in,
    pendingSync: true,
  }));
}

/** Xóa cờ pending_sync sau khi sync thành công */
export async function clearPendingSync(registrationId: string): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    'UPDATE registrations SET pending_sync = 0 WHERE id = ?',
    [registrationId]
  );
}

/** Đếm số bản ghi pending sync */
export async function countPendingSync(): Promise<number> {
  const database = await getDb();
  const result = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM registrations WHERE pending_sync = 1'
  );
  return result?.count ?? 0;
}

/** Lấy lịch sử quét gần nhất của 1 workshop */
export async function getRecentCheckins(workshopId: string, limit: number = 20): Promise<Registration[]> {
  const database = await getDb();

  const rows = await database.getAllAsync<{
    id: string;
    user_id: string;
    workshop_id: string;
    student_name: string;
    student_email: string;
    checked_in: string | null;
    pending_sync: number;
  }>(
    'SELECT * FROM registrations WHERE workshop_id = ? AND checked_in IS NOT NULL ORDER BY checked_in DESC LIMIT ?',
    [workshopId, limit]
  );

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    workshopId: row.workshop_id,
    studentName: row.student_name,
    studentEmail: row.student_email,
    checkedInAt: row.checked_in,
    pendingSync: row.pending_sync === 1,
  }));
}

// ─── End of Service ─────────────────────────────────────────

