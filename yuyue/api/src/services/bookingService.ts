import * as bookingRepository from '../repositories/bookingRepository.js';
import * as roomRepository from '../repositories/roomRepository.js';
import {
  Booking,
  CreateBookingRequest,
  CheckAvailabilityRequest,
  CheckAvailabilityResponse
} from '../../../shared/types.js';

function isValidTimeFormat(time: string): boolean {
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
}

function isValidDateFormat(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function isTimeRangeValid(startTime: string, endTime: string): boolean {
  const start = startTime.split(':').map(Number);
  const end = endTime.split(':').map(Number);
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];
  return endMinutes > startMinutes;
}

export function getAllBookings(date?: string, roomId?: number): Booking[] {
  return bookingRepository.findAll(date, roomId);
}

export function getBookingById(id: number): Booking | null {
  return bookingRepository.findById(id);
}

export function getBookingsByRoomAndDate(roomId: number, date: string): Booking[] {
  return bookingRepository.findByRoomAndDate(roomId, date);
}

export function checkAvailability(params: CheckAvailabilityRequest): CheckAvailabilityResponse {
  if (!isValidTimeFormat(params.startTime) || !isValidTimeFormat(params.endTime)) {
    throw new Error('时间格式不正确，应为 HH:mm');
  }
  
  if (!isValidDateFormat(params.date)) {
    throw new Error('日期格式不正确，应为 YYYY-MM-DD');
  }
  
  if (!isTimeRangeValid(params.startTime, params.endTime)) {
    throw new Error('结束时间必须晚于开始时间');
  }
  
  const conflictBookings = bookingRepository.checkAvailability(params);
  
  return {
    available: conflictBookings.length === 0,
    conflictBookings: conflictBookings.length > 0 ? conflictBookings : undefined
  };
}

export function createBooking(data: CreateBookingRequest): Booking {
  if (!data.meetingName || !data.meetingName.trim()) {
    throw new Error('会议名称不能为空');
  }
  
  if (!data.organizer || !data.organizer.trim()) {
    throw new Error('组织者不能为空');
  }
  
  if (!isValidTimeFormat(data.startTime) || !isValidTimeFormat(data.endTime)) {
    throw new Error('时间格式不正确，应为 HH:mm');
  }
  
  if (!isValidDateFormat(data.date)) {
    throw new Error('日期格式不正确，应为 YYYY-MM-DD');
  }
  
  if (!isTimeRangeValid(data.startTime, data.endTime)) {
    throw new Error('结束时间必须晚于开始时间');
  }
  
  const room = roomRepository.findById(data.roomId);
  if (!room) {
    throw new Error('会议室不存在');
  }
  
  if (data.attendees && data.attendees > room.capacity) {
    throw new Error(`参会人数超过会议室容纳人数（最多${room.capacity}人）`);
  }
  
  const availability = checkAvailability({
    roomId: data.roomId,
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime
  });
  
  if (!availability.available) {
    const conflicts = availability.conflictBookings || [];
    const conflictTimes = conflicts.map(c => `${c.startTime}-${c.endTime} (${c.meetingName})`).join('、');
    throw new Error(`该时间段已被占用：${conflictTimes}`);
  }
  
  return bookingRepository.create({
    ...data,
    meetingName: data.meetingName.trim(),
    organizer: data.organizer.trim(),
    attendees: data.attendees || 1
  });
}

export function deleteBooking(id: number): boolean {
  return bookingRepository.remove(id);
}
