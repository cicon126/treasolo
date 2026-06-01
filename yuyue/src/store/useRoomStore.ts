import { create } from 'zustand';
import { Room, CreateRoomRequest, UpdateRoomRequest } from '../../shared/types.js';
import { roomApi } from '../utils/api.js';

interface RoomState {
  rooms: Room[];
  selectedRoom: Room | null;
  loading: boolean;
  error: string | null;
  fetchRooms: () => Promise<void>;
  selectRoom: (room: Room | null) => void;
  createRoom: (data: CreateRoomRequest) => Promise<Room>;
  updateRoom: (id: number, data: UpdateRoomRequest) => Promise<Room>;
  deleteRoom: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  rooms: [],
  selectedRoom: null,
  loading: false,
  error: null,

  fetchRooms: async () => {
    set({ loading: true, error: null });
    try {
      const rooms = await roomApi.getAll();
      set({ rooms, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取会议室列表失败',
        loading: false
      });
    }
  },

  selectRoom: (room) => {
    set({ selectedRoom: room });
  },

  createRoom: async (data) => {
    set({ loading: true, error: null });
    try {
      const newRoom = await roomApi.create(data);
      set((state) => ({
        rooms: [...state.rooms, newRoom],
        loading: false
      }));
      return newRoom;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建会议室失败';
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  updateRoom: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updatedRoom = await roomApi.update(id, data);
      set((state) => ({
        rooms: state.rooms.map(r => r.id === id ? updatedRoom : r),
        selectedRoom: state.selectedRoom?.id === id ? updatedRoom : state.selectedRoom,
        loading: false
      }));
      return updatedRoom;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '更新会议室失败';
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  deleteRoom: async (id) => {
    set({ loading: true, error: null });
    try {
      await roomApi.delete(id);
      set((state) => ({
        rooms: state.rooms.filter(r => r.id !== id),
        selectedRoom: state.selectedRoom?.id === id ? null : state.selectedRoom,
        loading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '删除会议室失败';
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));
