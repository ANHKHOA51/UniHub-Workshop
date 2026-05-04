// ============================================================
// UniHub Workshop — Shared App State
// Module chia sẻ state giữa các tab mà không cần Context
// (dùng cho trạng thái nhẹ, không cần re-render toàn bộ)
// ============================================================

import { Workshop } from '@/types';

let _selectedWorkshop: Workshop | null = null;

export function getSelectedWorkshop(): Workshop | null {
  return _selectedWorkshop;
}

export function setSelectedWorkshop(workshop: Workshop | null): void {
  _selectedWorkshop = workshop;
}
