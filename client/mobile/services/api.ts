// ============================================================
// UniHub Workshop — API Service
// HTTP client gọi Backend API thật
// ============================================================

import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants/config';
import { Workshop, AuthTokens, User } from '@/types';

const TOKEN_KEY = 'unihub_access_token';
let memoryToken: string | null = null;

export function setAuthToken(token: string | null) {
  memoryToken = token;
}

// ─── Helper ─────────────────────────────────────────────────

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = memoryToken || await SecureStore.getItemAsync(TOKEN_KEY);
  console.log('[API] Retrieved token:', token ? 'YES' : 'NO');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = (body as any)?.message || `Server error: ${response.status}`;
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

// ─── Auth ───────────────────────────────────────────────────

export async function login(
  email: string,
  password: string
): Promise<{ user: User; tokens: AuthTokens }> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  return handleResponse<{ user: User; tokens: AuthTokens }>(response);
}

// ─── Workshops ──────────────────────────────────────────────

interface WorkshopRow {
  id?: string | number;
  workshop_id?: string | number;
  title?: string;
  description?: string;
  speaker?: string;
  
  // PostgreSQL schema fields
  location?: string;
  time?: string;
  capacity?: number;
  
  // Old fields or other naming conventions
  room?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  startTime?: string;
  endTime?: string;
  max_slots?: number;
  maxSlots?: number;
  registered_count?: number;
  registeredCount?: number;
  checked_in_count?: number;
  checkedInCount?: number;
}

/** Map backend row (snake_case/PostgreSQL) → mobile Workshop type (camelCase) */
function mapWorkshop(row: WorkshopRow): Workshop {
  let dateStr = row.date ?? '';
  let startTimeStr = row.startTime ?? row.start_time ?? '';
  
  if (row.time) {
    try {
      const d = new Date(row.time);
      if (!isNaN(d.getTime())) {
        dateStr = d.toISOString().split('T')[0];
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        startTimeStr = `${hours}:${minutes}`;
      }
    } catch {}
  }

  return {
    id: String(row.id ?? row.workshop_id ?? ''),
    title: row.title ?? '',
    description: row.description ?? '',
    speaker: row.speaker ?? '',
    room: row.location ?? row.room ?? '',
    date: dateStr,
    startTime: startTimeStr,
    endTime: row.endTime ?? row.end_time ?? '',
    maxSlots: row.capacity ?? row.maxSlots ?? row.max_slots ?? 0,
    registeredCount: row.registeredCount ?? row.registered_count ?? 0,
    checkedInCount: row.checkedInCount ?? row.checked_in_count ?? 0,
  };
}

/** Lấy danh sách tất cả workshops từ Backend */
export async function fetchWorkshops(): Promise<Workshop[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/workshops`, { headers });
  const data = await handleResponse<WorkshopRow[]>(response);
  return data.map(mapWorkshop);
}

/** Lấy chi tiết 1 workshop */
export async function fetchWorkshopById(id: string): Promise<Workshop> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/workshops/${id}`, { headers });
  const data = await handleResponse<WorkshopRow>(response);
  return mapWorkshop(data);
}
