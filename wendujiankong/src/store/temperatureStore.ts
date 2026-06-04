import { create } from 'zustand';

export type TemperatureStatus = 'normal' | 'too-high' | 'too-low';

interface TemperatureState {
  currentTemp: number;
  minTemp: number;
  maxTemp: number;
  status: TemperatureStatus;
  voiceEnabled: boolean;
  alarmEnabled: boolean;
  autoSimulate: boolean;
  lastStatus: TemperatureStatus | null;
}

interface Actions {
  setCurrentTemp: (temp: number) => void;
  setMinTemp: (temp: number) => void;
  setMaxTemp: (temp: number) => void;
  toggleVoice: () => void;
  toggleAlarm: () => void;
  toggleAutoSimulate: () => void;
  updateStatus: () => void;
}

const calculateStatus = (temp: number, min: number, max: number): TemperatureStatus => {
  if (temp > max) return 'too-high';
  if (temp < min) return 'too-low';
  return 'normal';
};

export const useTemperatureStore = create<TemperatureState & Actions>((set, get) => ({
  currentTemp: 25,
  minTemp: 18,
  maxTemp: 30,
  status: 'normal',
  voiceEnabled: true,
  alarmEnabled: true,
  autoSimulate: false,
  lastStatus: null,

  setCurrentTemp: (temp: number) => {
    set({ currentTemp: temp });
    get().updateStatus();
  },

  setMinTemp: (temp: number) => {
    set({ minTemp: temp });
    get().updateStatus();
  },

  setMaxTemp: (temp: number) => {
    set({ maxTemp: temp });
    get().updateStatus();
  },

  toggleVoice: () => set((state) => ({ voiceEnabled: !state.voiceEnabled })),

  toggleAlarm: () => set((state) => ({ alarmEnabled: !state.alarmEnabled })),

  toggleAutoSimulate: () => set((state) => ({ autoSimulate: !state.autoSimulate })),

  updateStatus: () => {
    const { currentTemp, minTemp, maxTemp, status } = get();
    const newStatus = calculateStatus(currentTemp, minTemp, maxTemp);
    if (newStatus !== status) {
      set({ status: newStatus, lastStatus: status });
    }
  },
}));
