import { create } from 'zustand';
import type { HealthRecord, UserProfile } from '@/types/health';
import { MOCK_RECORDS, MOCK_PROFILE } from '@/data/healthData';

interface HealthState {
  records: HealthRecord[];
  profile: UserProfile;
  addRecord: (record: HealthRecord) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  getTodayRecord: () => HealthRecord | undefined;
  getRecentRecords: (days: number) => HealthRecord[];
}

export const useHealthStore = create<HealthState>((set, get) => ({
  records: MOCK_RECORDS,
  profile: MOCK_PROFILE,

  addRecord: (record) => {
    set((state) => {
      const existIndex = state.records.findIndex(
        (r) => r.date === record.date
      );
      if (existIndex >= 0) {
        const newRecords = [...state.records];
        newRecords[existIndex] = { ...newRecords[existIndex], ...record };
        return { records: newRecords };
      }
      return { records: [record, ...state.records] };
    });
  },

  updateProfile: (partial) => {
    set((state) => ({
      profile: { ...state.profile, ...partial }
    }));
  },

  getTodayRecord: () => {
    const today = new Date().toISOString().slice(0, 10);
    return get().records.find((r) => r.date === today);
  },

  getRecentRecords: (days) => {
    return get().records.slice(0, days);
  }
}));
