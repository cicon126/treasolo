import { useMemo } from 'react';
import { Clock } from 'lucide-react';
import { generateTimeSlots, isTimeInRange, timeToMinutes, minutesToTime } from '../utils/dateUtils.js';
import { Booking } from '../../shared/types.js';

interface TimeSlotProps {
  selectedSlot: { start: string; end: string } | null;
  onSlotSelect: (slot: { start: string; end: string } | null) => void;
  bookings: Booking[];
  disabled?: boolean;
}

export default function TimeSlot({ selectedSlot, onSlotSelect, bookings, disabled }: TimeSlotProps) {
  const timeSlots = useMemo(() => generateTimeSlots(8, 20), []);

  const getSlotStatus = (time: string) => {
    for (const booking of bookings) {
      if (isTimeInRange(time, booking.startTime, booking.endTime)) {
        return 'booked';
      }
    }
    if (selectedSlot && isTimeInRange(time, selectedSlot.start, selectedSlot.end)) {
      return 'selected';
    }
    return 'available';
  };

  const handleSlotClick = (index: number) => {
    if (disabled) return;
    
    const startTime = timeSlots[index];
    const status = getSlotStatus(startTime);
    
    if (status === 'booked') return;
    
    if (selectedSlot && selectedSlot.start === startTime) {
      onSlotSelect(null);
      return;
    }
    
    let endIndex = index + 1;
    while (endIndex < timeSlots.length) {
      const nextTime = timeSlots[endIndex];
      const nextStatus = getSlotStatus(nextTime);
      if (nextStatus === 'booked') break;
      endIndex++;
    }
    
    const endTime = minutesToTime(timeToMinutes(timeSlots[Math.min(index + 2, endIndex - 1)]) + 30);
    onSlotSelect({ start: startTime, end: endTime });
  };

  const handleDragSelect = (startIndex: number, endIndex: number) => {
    if (disabled) return;
    
    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);
    
    for (let i = minIndex; i <= maxIndex; i++) {
      if (getSlotStatus(timeSlots[i]) === 'booked') return;
    }
    
    const start = timeSlots[minIndex];
    const end = minutesToTime(timeToMinutes(timeSlots[maxIndex]) + 30);
    onSlotSelect({ start, end });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-800">选择时间段</h3>
      </div>

      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-400" />
          <span className="text-slate-600">可预约</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-rose-100 border border-rose-400" />
          <span className="text-slate-600">已占用</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-indigo-600" />
          <span className="text-slate-600">已选择</span>
        </div>
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
        {timeSlots.map((time, index) => {
          const status = getSlotStatus(time);
          return (
            <button
              key={time}
              onClick={() => handleSlotClick(index)}
              disabled={status === 'booked' || disabled}
              className={`
                relative py-3 px-2 rounded-xl text-xs font-medium
                transition-all duration-300 transform
                ${status === 'available'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:scale-105'
                  : status === 'booked'
                    ? 'bg-rose-50 text-rose-400 border border-rose-200 cursor-not-allowed'
                    : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg scale-105'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {time}
              {status === 'booked' && (
                <div className="absolute inset-0 rounded-xl bg-rose-200/30 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {selectedSlot && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <p className="text-sm text-slate-700">
            已选择时间段：
            <span className="font-semibold text-blue-600 ml-2">
              {selectedSlot.start} - {selectedSlot.end}
            </span>
          </p>
        </div>
      )}

      {bookings.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-slate-700 mb-2">当日已有预约：</h4>
          <div className="space-y-2">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-3 bg-rose-50 rounded-lg border border-rose-200"
              >
                <span className="text-sm text-slate-700">{booking.meetingName}</span>
                <span className="text-sm font-medium text-rose-600">
                  {booking.startTime} - {booking.endTime}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
