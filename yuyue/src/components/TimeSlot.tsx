import { useState, useMemo, useCallback } from 'react';
import { Clock, ChevronDown } from 'lucide-react';
import { generateTimeSlots, isTimeInRange, timeToMinutes, minutesToTime } from '../utils/dateUtils.js';
import { Booking } from '../../shared/types.js';

interface TimeSlotProps {
  selectedSlot: { start: string; end: string } | null;
  onSlotSelect: (slot: { start: string; end: string } | null) => void;
  bookings: Booking[];
  disabled?: boolean;
}

const START_HOUR = 8;
const END_HOUR = 20;
const INTERVAL = 15;

export default function TimeSlot({ selectedSlot, onSlotSelect, bookings, disabled }: TimeSlotProps) {
  const timeSlots = useMemo(() => generateTimeSlots(START_HOUR, END_HOUR, INTERVAL), []);
  const [selectingStep, setSelectingStep] = useState<'idle' | 'selectingStart' | 'selectingEnd'>('idle');

  const getSlotStatus = useCallback((time: string) => {
    for (const booking of bookings) {
      if (isTimeInRange(time, booking.startTime, booking.endTime)) {
        return 'booked';
      }
    }
    if (selectedSlot) {
      if (time === selectedSlot.start) return 'start';
      if (time === selectedSlot.end) return 'end';
      if (isTimeInRange(time, selectedSlot.start, selectedSlot.end)) return 'selected';
    }
    return 'available';
  }, [bookings, selectedSlot]);

  const getDuration = (start: string, end: string) => {
    const diff = timeToMinutes(end) - timeToMinutes(start);
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}小时${mins}分钟`;
    } else if (hours > 0) {
      return `${hours}小时`;
    } else {
      return `${mins}分钟`;
    }
  };

  const handleSlotClick = (time: string) => {
    if (disabled) return;
    const status = getSlotStatus(time);
    if (status === 'booked') return;

    if (selectingStep === 'idle' || selectingStep === 'selectingStart') {
      onSlotSelect({ start: time, end: minutesToTime(timeToMinutes(time) + 60) });
      setSelectingStep('selectingEnd');
    } else if (selectingStep === 'selectingEnd') {
      if (selectedSlot && timeToMinutes(time) > timeToMinutes(selectedSlot.start)) {
        const isValid = checkRangeValid(selectedSlot.start, time);
        if (isValid) {
          onSlotSelect({ ...selectedSlot, end: time });
          setSelectingStep('idle');
        }
      } else {
        onSlotSelect({ start: time, end: minutesToTime(timeToMinutes(time) + 60) });
        setSelectingStep('selectingEnd');
      }
    }
  };

  const checkRangeValid = (start: string, end: string): boolean => {
    const startIdx = timeSlots.indexOf(start);
    const endIdx = timeSlots.indexOf(end);
    if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) return false;
    
    for (let i = startIdx; i < endIdx; i++) {
      if (getSlotStatus(timeSlots[i]) === 'booked') {
        return false;
      }
    }
    return true;
  };

  const handleStartTimeChange = (time: string) => {
    if (disabled) return;
    const endTime = selectedSlot?.end || minutesToTime(timeToMinutes(time) + 60);
    
    if (timeToMinutes(endTime) > timeToMinutes(time) && checkRangeValid(time, endTime)) {
      onSlotSelect({ start: time, end: endTime });
    } else {
      const newEnd = findNextValidEnd(time);
      onSlotSelect({ start: time, end: newEnd });
    }
    setSelectingStep('selectingEnd');
  };

  const handleEndTimeChange = (time: string) => {
    if (disabled || !selectedSlot) return;
    if (timeToMinutes(time) <= timeToMinutes(selectedSlot.start)) return;
    
    if (checkRangeValid(selectedSlot.start, time)) {
      onSlotSelect({ ...selectedSlot, end: time });
      setSelectingStep('idle');
    }
  };

  const findNextValidEnd = (start: string): string => {
    const startIdx = timeSlots.indexOf(start);
    for (let i = startIdx + 1; i < timeSlots.length; i++) {
      if (getSlotStatus(timeSlots[i]) === 'booked') {
        return timeSlots[i];
      }
    }
    return timeSlots[timeSlots.length - 1];
  };

  const getAvailableEndTimes = (): string[] => {
    if (!selectedSlot) return [];
    const startIdx = timeSlots.indexOf(selectedSlot.start);
    const result: string[] = [];
    
    for (let i = startIdx + 1; i < timeSlots.length; i++) {
      if (getSlotStatus(timeSlots[i]) === 'booked') break;
      result.push(timeSlots[i]);
    }
    return result;
  };

  const handleQuickSelect = (minutes: number) => {
    if (disabled) return;
    const slotsNeeded = Math.ceil(minutes / INTERVAL);
    
    for (let i = 0; i < timeSlots.length; i++) {
      const endIdx = i + slotsNeeded;
      if (endIdx > timeSlots.length) break;
      
      let valid = true;
      for (let j = i; j < endIdx; j++) {
        if (getSlotStatus(timeSlots[j]) === 'booked') {
          valid = false;
          break;
        }
      }
      
      if (valid) {
        onSlotSelect({ start: timeSlots[i], end: timeSlots[endIdx] });
        setSelectingStep('idle');
        return;
      }
    }
  };

  const hours = useMemo(() => {
    return Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-800">选择时间段</h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[30, 60, 90, 120].map((mins) => (
          <button
            key={mins}
            onClick={() => handleQuickSelect(mins)}
            disabled={disabled}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mins >= 60 ? `${mins / 60}小时` : `${mins}分钟`}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-700">时间轴</span>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
              <span className="text-slate-500">可用</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-rose-100 border border-rose-300" />
              <span className="text-slate-500">已约</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-slate-500">已选</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="flex mb-1">
            {hours.map((hour) => (
              <div
                key={hour}
                className="flex-1 text-xs text-slate-400 text-center font-medium"
              >
                {String(hour).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          <div className="flex h-12 rounded-xl overflow-hidden border border-slate-200">
            {timeSlots.map((time, index) => {
              const status = getSlotStatus(time);
              const isHourStart = index % 4 === 0;
              
              return (
                <button
                  key={time}
                  onClick={() => handleSlotClick(time)}
                  disabled={status === 'booked' || disabled}
                  className={`
                    flex-1 h-full relative transition-all duration-200
                    ${isHourStart ? 'border-l border-l-slate-200' : ''}
                    ${status === 'available'
                      ? 'bg-emerald-50 hover:bg-emerald-100 cursor-pointer'
                      : status === 'booked'
                        ? 'bg-rose-100 cursor-not-allowed'
                        : status === 'start'
                          ? 'bg-blue-500'
                          : status === 'end'
                            ? 'bg-blue-500'
                            : status === 'selected'
                              ? 'bg-blue-400'
                              : 'bg-emerald-50'
                    }
                    ${disabled ? 'opacity-50' : ''}
                  `}
                >
                  {status === 'start' && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 text-xs font-bold text-white bg-blue-600 px-1.5 py-0.5 rounded shadow z-10">
                      {time}
                    </span>
                  )}
                  {status === 'end' && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-xs font-bold text-white bg-blue-600 px-1.5 py-0.5 rounded shadow z-10">
                      {time}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-slate-400 mt-2 text-center">
            {selectingStep === 'idle' && '点击时间轴选择开始时间'}
            {selectingStep === 'selectingStart' && '点击时间轴选择开始时间'}
            {selectingStep === 'selectingEnd' && '继续点击选择结束时间，或使用下方下拉框'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            开始时间
          </label>
          <div className="relative">
            <select
              value={selectedSlot?.start || ''}
              onChange={(e) => handleStartTimeChange(e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-3 pr-10 text-base font-medium rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">请选择</option>
              {timeSlots.filter((t) => getSlotStatus(t) !== 'booked').map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            结束时间
          </label>
          <div className="relative">
            <select
              value={selectedSlot?.end || ''}
              onChange={(e) => handleEndTimeChange(e.target.value)}
              disabled={disabled || !selectedSlot}
              className="w-full px-4 py-3 pr-10 text-base font-medium rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">请选择</option>
              {getAvailableEndTimes().map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {selectedSlot && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-700">
                已选择：
                <span className="font-semibold text-blue-600 ml-2">
                  {selectedSlot.start} - {selectedSlot.end}
                </span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                时长：<span className="font-medium text-emerald-600">{getDuration(selectedSlot.start, selectedSlot.end)}</span>
              </p>
            </div>
            <button
              onClick={() => {
                onSlotSelect(null);
                setSelectingStep('idle');
              }}
              className="px-3 py-1.5 text-sm text-slate-600 hover:bg-white hover:shadow rounded-lg transition-all duration-200"
            >
              清除
            </button>
          </div>
        </div>
      )}

      {bookings.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h4 className="text-sm font-medium text-slate-700 mb-3">当日已有预约</h4>
          <div className="space-y-2">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-3 bg-rose-50 rounded-lg border border-rose-100"
              >
                <div>
                  <p className="text-sm font-medium text-slate-700">{booking.meetingName}</p>
                  <p className="text-xs text-slate-500">{getDuration(booking.startTime, booking.endTime)}</p>
                </div>
                <span className="text-sm font-semibold text-rose-600">
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
