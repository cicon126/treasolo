export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  description?: string;
  createdAt: string;
}

export interface LunarInfo {
  year: number;
  month: number;
  day: number;
  yearGanZhi: string;
  yearShengXiao: string;
  monthName: string;
  dayName: string;
  isLeap: boolean;
}

export interface DateInfo {
  date: Date;
  year: number;
  month: number;
  day: number;
  weekDay: number;
  weekDayName: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  lunar: LunarInfo;
  festival?: string;
  hasEvents: boolean;
}

export type CalendarView = 'month';
