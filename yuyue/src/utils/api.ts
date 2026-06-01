import {
  Room,
  Booking,
  CreateRoomRequest,
  UpdateRoomRequest,
  CreateBookingRequest,
  CheckAvailabilityRequest,
  CheckAvailabilityResponse,
  ApiResponse
} from '../../shared/types.js';

const API_BASE_URL = '/api';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  const data = await response.json() as ApiResponse<T>;
  
  if (!data.success) {
    throw new Error(data.error || '请求失败');
  }
  
  return data.data as T;
}

export const roomApi = {
  getAll: () => request<Room[]>('/rooms'),
  getById: (id: number) => request<Room>(`/rooms/${id}`),
  create: (data: CreateRoomRequest) => request<Room>('/rooms', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id: number, data: UpdateRoomRequest) => request<Room>(`/rooms/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id: number) => request<void>(`/rooms/${id}`, {
    method: 'DELETE'
  })
};

export const bookingApi = {
  getAll: (params?: { date?: string; roomId?: number }) => {
    const query = new URLSearchParams();
    if (params?.date) query.append('date', params.date);
    if (params?.roomId) query.append('roomId', params.roomId.toString());
    const queryString = query.toString();
    return request<Booking[]>(`/bookings${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id: number) => request<Booking>(`/bookings/${id}`),
  getByRoomAndDate: (roomId: number, date: string) => {
    const query = new URLSearchParams({ roomId: roomId.toString(), date });
    return request<Booking[]>(`/bookings/room-date?${query.toString()}`);
  },
  checkAvailability: (data: CheckAvailabilityRequest) => request<CheckAvailabilityResponse>('/bookings/check', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  create: (data: CreateBookingRequest) => request<Booking>('/bookings', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  delete: (id: number) => request<void>(`/bookings/${id}`, {
    method: 'DELETE'
  })
};
