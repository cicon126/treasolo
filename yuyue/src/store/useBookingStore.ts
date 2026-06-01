import { create } from 'zustand';
import {
  Booking,
  CreateBookingRequest,
  CheckAvailabilityRequest,
  CheckAvailabilityResponse
} from '../../shared/types.js';
import { bookingApi } from '../utils/api.js';

interface BookingState {
  bookings: Booking[];
  selectedDate: string;
  selectedTimeSlot: { start: string; end: string } | null;
  loading: boolean;
  error: string | null;
  fetchBookings: (params?: { date?: string; roomId?: number }) => Promise<void>;
  fetchBookingsByRoomAndDate: (roomId: number, date: string) => Promise<Booking[]>;
  checkAvailability: (params: CheckAvailabilityRequest) => Promise<CheckAvailabilityResponse>;
  createBooking: (data: CreateBookingRequest) => Promise<Booking>;
  deleteBooking: (id: number) => Promise<void>;
  setSelectedDate: (date: string) => void;
  setSelectedTimeSlot: (slot: { start: string; end: string } | null) => void;
  clearError: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  selectedDate: new Date().toISOString().split('T')[0],
  selectedTimeSlot: null,
  loading: false,
  error: null,

  fetchBookings: async (params) => {
    set({ loading: true, error: null });
    try {
      const bookings = await bookingApi.getAll(params);
      set({ bookings, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取预约列表失败',
        loading: false
      });
    }
  },

  fetchBookingsByRoomAndDate: async (roomId, date) => {
    set({ loading: true, error: null });
    try {
      const bookings = await bookingApi.getByRoomAndDate(roomId, date);
      set({ loading: false });
      return bookings;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取预约列表失败';
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  checkAvailability: async (params) => {
    set({ error: null });
    try {
      const result = await bookingApi.checkAvailability(params);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '检查可用性失败';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  createBooking: async (data) => {
    set({ loading: true, error: null });
    try {
      const booking = await bookingApi.create(data);
      set((state) => ({
        bookings: [...state.bookings, booking].sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return a.startTime.localeCompare(b.startTime);
        }),
        selectedTimeSlot: null,
        loading: false
      }));
      return booking;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建预约失败';
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  deleteBooking: async (id) => {
    set({ loading: true, error: null });
    try {
      await bookingApi.delete(id);
      set((state) => ({
        bookings: state.bookings.filter(b => b.id !== id),
        loading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '取消预约失败';
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  setSelectedDate: (date) => {
    set({ selectedDate: date, selectedTimeSlot: null });
  },

  setSelectedTimeSlot: (slot) => {
    set({ selectedTimeSlot: slot });
  },

  clearError: () => {
    set({ error: null });
  }
}));
