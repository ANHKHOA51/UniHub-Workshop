import * as workshopApi from './workshopApi';

const normalizeWorkshop = (raw) => {
  const capacity = raw.capacity ?? 0;
  const registeredCount = raw.registered_count ?? 0;
  const slotsLeft = Math.max(0, capacity - registeredCount);

  return {
    id: raw.id,
    title: raw.title ?? '',
    description: raw.description ?? '',
    time: raw.time ?? null,
    speaker: raw.speaker ?? '',
    floor_plan: raw.floor_plan ?? null,
    location: raw.location ?? '',
    price: parseFloat(raw.price ?? 0),
    capacity,
    slotsLeft,
    registered_count: registeredCount,
    checked_in_count: raw.checked_in_count ?? 0,
    summary: raw.summary ?? null,
    created_at: raw.created_at ?? null,
    status: raw.status ?? null,
    qr_code: raw.qr_code ?? null,
  };
};

export const getWorkshops = async () => {
  const data = await workshopApi.fetchWorkshops();
  if (!Array.isArray(data)) {
    throw new Error('Invalid response from server: expected an array of workshops.');
  }
  return data.map(normalizeWorkshop);
};

export const getWorkshopById = async (id) => {
  if (!id) throw new Error('Workshop ID is required.');
  const data = await workshopApi.fetchWorkshopById(id);
  return normalizeWorkshop(data);
};

export const getRegisteredWorkshops = async () => {
  const data = await workshopApi.fetchRegisteredWorkshops();
  if (!Array.isArray(data)) {
    throw new Error('Invalid response from server: expected an array of workshops.');
  }
  return data.map(normalizeWorkshop);
};

export const registerWorkshop = async (workshopId) => {
  if (!workshopId) throw new Error('Workshop ID is required.');
  const response = await workshopApi.registerWorkshop(workshopId);
  return response;
};

export const registerPaidWorkshop = async (workshopId, idempotencyKey) => {
  if (!workshopId) throw new Error('Workshop ID is required.');
  if (!idempotencyKey) throw new Error('Idempotency Key is required.');
  const response = await workshopApi.registerPaidWorkshop(workshopId, idempotencyKey);
  return response;
};

export const updateWorkshop = async (id, data) => {
  if (!id) throw new Error('Workshop ID is required.');
  const response = await workshopApi.updateWorkshop(id, data);
  return normalizeWorkshop(response.workshop || response);
};

export const deleteWorkshop = async (id) => {
  if (!id) throw new Error('Workshop ID is required.');
  const response = await workshopApi.deleteWorkshop(id);
  return response;
};

export const createWorkshop = async (data) => {
  const formData = new FormData();
  
  // Append basic info
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('time', data.time);
  formData.append('speaker', data.speaker);
  formData.append('location', data.location);
  formData.append('price', data.price);
  formData.append('capacity', data.capacity);

  // Append files
  if (data.floor_plan) {
    formData.append('floor_plan', data.floor_plan);
  }
  if (data.pdf) {
    formData.append('pdf', data.pdf);
  }

  const response = await workshopApi.createWorkshop(formData);
  return normalizeWorkshop(response.workshop || response);
};

export const getWorkshopRegistrations = async (id) => {
  if (!id) throw new Error('Workshop ID is required.');
  const data = await workshopApi.fetchWorkshopRegistrations(id);
  return data;
};
