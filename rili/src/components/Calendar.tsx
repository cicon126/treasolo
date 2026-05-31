import { useMemo } from 'react';
import { DateInfo } from '../types';
import { solarToLunar, getWeekDayName, isSameDay, formatDateKey } from '../utils/lunar';
import { getHoliday } from '../utils/holiday';
import DateCell from './DateCell';

interface CalendarProps {
  year: number;
  month: number;
  selectedDate: Date | null;
  datesWithEvents: Set<string>;
  onSelectDate: (date: Date) => void;
}

const WEEK_HEADERS = ['日', '一', '二', '三', '四', '五', '六'];

export default function Calendar({ year, month, selectedDate, datesWithEvents, onSelectDate }: CalendarProps) {
  const dates = useMemo(() => {
    return generateCalendarDates(year, month, datesWithEvents);
  }, [year, month, datesWithEvents]);

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10">
      <div className="grid grid-cols-7 gap-2 mb-4">
        {WEEK_HEADERS.map((day, index) => (
          <div
            key={day}
            className={`
              text-center py-2 text-sm font-semibold
              ${index === 0 || index === 6 ? 'text-rose-400' : 'text-white/70'}
            `}
          >
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {dates.map((dateInfo) => (
          <DateCell
            key={formatDateKey(dateInfo.date) + dateInfo.isCurrentMonth}
            dateInfo={dateInfo}
            isSelected={selectedDate ? isSameDay(dateInfo.date, selectedDate) : false}
            onClick={() => onSelectDate(dateInfo.date)}
          />
        ))}
      </div>
    </div>
  );
}

function generateCalendarDates(year: number, month: number, datesWithEvents: Set<string>): DateInfo[] {
  const today = new Date();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  
  const dates: DateInfo[] = [];
  
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i);
    dates.push(createDateInfo(date, false, today, datesWithEvents));
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    dates.push(createDateInfo(date, true, today, datesWithEvents));
  }
  
  const remainingDays = 42 - dates.length;
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    dates.push(createDateInfo(date, false, today, datesWithEvents));
  }
  
  return dates;
}

function createDateInfo(date: Date, isCurrentMonth: boolean, today: Date, datesWithEvents: Set<string>): DateInfo {
  const lunar = solarToLunar(date);
  const weekDay = date.getDay();
  const festival = getHoliday(
    date.getMonth() + 1,
    date.getDate(),
    lunar.month,
    lunar.day
  );
  
  return {
    date,
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
    weekDay,
    weekDayName: getWeekDayName(weekDay),
    isToday: isSameDay(date, today),
    isCurrentMonth,
    lunar,
    festival,
    hasEvents: datesWithEvents.has(formatDateKey(date))
  };
}
