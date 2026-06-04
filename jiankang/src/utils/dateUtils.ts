import dayjs from 'dayjs';

export const formatDate = (date: string | Date, format = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

export const formatTime = (date: string | Date, format = 'HH:mm'): string => {
  return dayjs(date).format(format);
};

export const getToday = (): string => {
  return dayjs().format('YYYY-MM-DD');
};

export const getNow = (): string => {
  return dayjs().format('HH:mm');
};

export const getDateRange = (days: number): string[] => {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    dates.push(dayjs().subtract(i, 'day').format('MM-DD'));
  }
  return dates;
};

export const getRecentDays = (days: number): string[] => {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    dates.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD'));
  }
  return dates;
};

export const getRelativeDateLabel = (dateStr: string): string => {
  const today = dayjs().format('YYYY-MM-DD');
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  if (dateStr === today) return '今天';
  if (dateStr === yesterday) return '昨天';
  return dayjs(dateStr).format('MM月DD日');
};
