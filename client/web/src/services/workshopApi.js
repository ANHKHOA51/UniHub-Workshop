import { API_BASE_URL } from '../utils/constants';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchWorkshops = async () => {
  const response = await fetch(`${API_BASE_URL}/workshops`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error ${response.status}`);
  }

  return response.json();
};

export const fetchWorkshopById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/workshops/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error ${response.status}`);
  }

  return response.json();
};

export const fetchRegisteredWorkshops = async () => {
  const response = await fetch(`${API_BASE_URL}/workshops/registered`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error ${response.status}`);
  }

  return response.json();
};

export const registerWorkshop = async (workshopId) => {
  const response = await fetch(`${API_BASE_URL}/registrations`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ workshopId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error ${response.status}`);
  }

  return response.json();
};

export const registerPaidWorkshop = async (workshopId, idempotencyKey) => {
  const response = await fetch(`${API_BASE_URL}/registrations/payment`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({ workshopId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error ${response.status}`);
  }

  return response.json();
};
