export interface Room {
  id: number;
  name: string;
  capacity: number;
  location: string;
  equipment: string[];
  description?: string;
  createdAt: string;
}

export interface Booking {
  id: number;
  roomId: number;
  roomName: string;
  meetingName: string;
  date: string;
  startTime: string;
  endTime: string;
  organizer: string;
  attendees?: number;
  createdAt: string;
}

export interface CreateRoomRequest {
  name: string;
  capacity: number;
  location: string;
  equipment: string[];
  description?: string;
}

export type UpdateRoomRequest = Partial<CreateRoomRequest>;

export interface CreateBookingRequest {
  roomId: number;
  meetingName: string;
  date: string;
  startTime: string;
  endTime: string;
  organizer: string;
  attendees?: number;
}

export interface CheckAvailabilityRequest {
  roomId: number;
  date: string;
  startTime: string;
  endTime: string;
  excludeBookingId?: number;
}

export interface CheckAvailabilityResponse {
  available: boolean;
  conflictBookings?: Booking[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
