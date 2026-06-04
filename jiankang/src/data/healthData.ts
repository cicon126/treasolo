import type { HealthRecord } from '@/types/health';

export const MOCK_RECORDS: HealthRecord[] = [
  { id: '1', date: '2026-06-04', time: '08:30', weight: 68.5, systolic: 122, diastolic: 78, bloodSugar: 5.2, heartRate: 72 },
  { id: '2', date: '2026-06-03', time: '08:15', weight: 68.8, systolic: 118, diastolic: 76, bloodSugar: 5.0, heartRate: 70 },
  { id: '3', date: '2026-06-02', time: '08:45', weight: 69.0, systolic: 125, diastolic: 82, bloodSugar: 5.6, heartRate: 75 },
  { id: '4', date: '2026-06-01', time: '09:00', weight: 69.2, systolic: 120, diastolic: 79, bloodSugar: 5.3, heartRate: 71 },
  { id: '5', date: '2026-05-31', time: '08:20', weight: 69.5, systolic: 130, diastolic: 85, bloodSugar: 5.8, heartRate: 78 },
  { id: '6', date: '2026-05-30', time: '08:10', weight: 69.3, systolic: 126, diastolic: 80, bloodSugar: 5.4, heartRate: 73 },
  { id: '7', date: '2026-05-29', time: '08:35', weight: 69.8, systolic: 119, diastolic: 77, bloodSugar: 5.1, heartRate: 69 },
  { id: '8', date: '2026-05-28', time: '08:50', weight: 70.0, systolic: 123, diastolic: 81, bloodSugar: 5.5, heartRate: 74 },
  { id: '9', date: '2026-05-27', time: '09:10', weight: 70.2, systolic: 128, diastolic: 83, bloodSugar: 5.7, heartRate: 76 },
  { id: '10', date: '2026-05-26', time: '08:25', weight: 70.5, systolic: 121, diastolic: 78, bloodSugar: 5.0, heartRate: 68 },
  { id: '11', date: '2026-05-25', time: '08:40', weight: 70.3, systolic: 124, diastolic: 79, bloodSugar: 5.3, heartRate: 71 },
  { id: '12', date: '2026-05-24', time: '08:55', weight: 70.8, systolic: 132, diastolic: 88, bloodSugar: 6.0, heartRate: 80 },
  { id: '13', date: '2026-05-23', time: '08:30', weight: 71.0, systolic: 127, diastolic: 84, bloodSugar: 5.6, heartRate: 75 },
  { id: '14', date: '2026-05-22', time: '08:05', weight: 71.2, systolic: 118, diastolic: 75, bloodSugar: 4.9, heartRate: 67 }
];

export const MOCK_PROFILE = {
  name: '小明',
  age: 32,
  gender: 'male' as const,
  height: 175,
  targetWeight: 68,
  reminderEnabled: true,
  reminderTime: '08:00'
};
