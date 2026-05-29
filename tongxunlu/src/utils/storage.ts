import Taro from '@tarojs/taro';

const STORAGE_KEYS = {
  CUSTOMERS: 'crm_customers',
  FOLLOWUPS: 'crm_followups',
};

export const getStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const data = Taro.getStorageSync(key);
    return data ? (JSON.parse(data) as T) : defaultValue;
  } catch (error) {
    console.error('[Storage] getStorage error:', error);
    return defaultValue;
  }
};

export const setStorage = <T>(key: string, value: T): void => {
  try {
    Taro.setStorageSync(key, JSON.stringify(value));
  } catch (error) {
    console.error('[Storage] setStorage error:', error);
  }
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD HH:mm'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes);
};

export const getTodayStr = (): string => {
  const today = new Date();
  return formatDate(today, 'YYYY-MM-DD');
};

export const isToday = (dateStr: string): boolean => {
  return dateStr.startsWith(getTodayStr());
};

export const isOverdue = (dateStr: string): boolean => {
  return new Date(dateStr) < new Date(getTodayStr());
};

export const isUpcoming = (dateStr: string, days: number = 3): boolean => {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
};

export { STORAGE_KEYS };
