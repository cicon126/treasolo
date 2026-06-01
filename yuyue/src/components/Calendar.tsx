import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getDaysInMonth, isSameDay, isToday, isPast, formatDate } from '../utils/dateUtils.js';
import { Booking } from '../../shared/types.js';

interface CalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  bookings?: Booking[];
}

export default function Calendar({ selectedDate, onDateSelect, bookings = [] }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = new Date(selectedDate);
    return { year: date.getFullYear(), month: date.getMonth() };
  });

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  const days = useMemo(() => {
    return getDaysInMonth(currentMonth.year, currentMonth.month);
  }, [currentMonth]);

  const datesWithBookings = useMemo(() => {
    return new Set(bookings.map(b => b.date));
  }, [bookings]);

  const prevMonth = () => {
    setCurrentMonth(prev => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { ...prev, month: prev.month - 1 };
    });
  };

  const nextMonth = () => {
    setCurrentMonth(prev => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { ...prev, month: prev.month + 1 };
    });
  };

  const handleDateClick = (date: Date) => {
    if (!isPast(date)) {
      onDateSelect(formatDate(date));
    }
  };

  const selectedDateObj = new Date(selectedDate);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h3 className="text-lg font-semibold text-slate-800">
          {currentMonth.year}年 {monthNames[currentMonth.month]}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div
            key={day}
            className="text-center text-sm font-medium text-slate-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const dateStr = formatDate(date);
          const isCurrentMonth = date.getMonth() === currentMonth.month;
          const isSelected = isSameDay(date, selectedDateObj);
          const hasBooking = datesWithBookings.has(dateStr);
          const past = isPast(date);
          const today = isToday(date);

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              disabled={past}
              className={`
                relative aspect-square rounded-xl flex items-center justify-center
                text-sm font-medium transition-all duration-300
                ${!isCurrentMonth ? 'text-slate-300' : ''}
                ${past ? 'text-slate-300 cursor-not-allowed bg-slate-50' : 'hover:bg-blue-50'}
                ${isSelected ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg scale-105' : ''}
                ${today && !isSelected ? 'ring-2 ring-blue-400 ring-inset' : ''}
              `}
            >
              {date.getDate()}
              {hasBooking && !isSelected && (
                <div className="absolute bottom-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
