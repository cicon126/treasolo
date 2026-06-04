export interface HealthRecord {
  id: string;
  date: string;
  time: string;
  weight?: number;
  systolic?: number;
  diastolic?: number;
  bloodSugar?: number;
  heartRate?: number;
}

export interface HealthScore {
  total: number;
  weightScore: number;
  bpScore: number;
  sugarScore: number;
  heartScore: number;
}

export type MetricType = 'weight' | 'bloodPressure' | 'bloodSugar' | 'heartRate';

export interface MetricConfig {
  type: MetricType;
  label: string;
  unit: string;
  icon: string;
  color: string;
  bgColor: string;
  normalRange: string;
}

export interface HealthAdvice {
  type: MetricType;
  level: 'normal' | 'warning' | 'danger';
  title: string;
  description: string;
  suggestions: string[];
}

export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female';
  height: number;
  targetWeight?: number;
  reminderEnabled: boolean;
  reminderTime: string;
}

export interface TrendData {
  date: string;
  value: number;
}

export const METRIC_CONFIGS: MetricConfig[] = [
  {
    type: 'weight',
    label: '体重',
    unit: 'kg',
    icon: '⚖️',
    color: '#FF7D00',
    bgColor: '#FFF7E6',
    normalRange: 'BMI 18.5-24'
  },
  {
    type: 'bloodPressure',
    label: '血压',
    unit: 'mmHg',
    icon: '🩺',
    color: '#3491FA',
    bgColor: '#E8F3FF',
    normalRange: '90-140/60-90'
  },
  {
    type: 'bloodSugar',
    label: '血糖',
    unit: 'mmol/L',
    icon: '🩸',
    color: '#F53F3F',
    bgColor: '#FFF0F0',
    normalRange: '3.9-6.1'
  },
  {
    type: 'heartRate',
    label: '心率',
    unit: 'bpm',
    icon: '❤️',
    color: '#722ED1',
    bgColor: '#F5E8FF',
    normalRange: '60-100'
  }
];
