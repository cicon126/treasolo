import { CalendarEvent } from '../types';
import { formatDateKey } from './lunar';

const STORAGE_KEY = 'calendar_events';

export function getEvents(): CalendarEvent[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveEvents(events: CalendarEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('保存事件失败:', error);
  }
}

export function addEvent(event: Omit<CalendarEvent, 'id' | 'createdAt'>): CalendarEvent {
  const events = getEvents();
  const newEvent: CalendarEvent = {
    ...event,
    id: generateId(),
    createdAt: new Date().toISOString()
  };
  events.push(newEvent);
  saveEvents(events);
  return newEvent;
}

export function updateEvent(id: string, updates: Partial<CalendarEvent>): CalendarEvent | null {
  const events = getEvents();
  const index = events.findIndex(e => e.id === id);
  if (index === -1) return null;
  
  events[index] = { ...events[index], ...updates };
  saveEvents(events);
  return events[index];
}

export function deleteEvent(id: string): boolean {
  const events = getEvents();
  const filtered = events.filter(e => e.id !== id);
  if (filtered.length === events.length) return false;
  saveEvents(filtered);
  return true;
}

export function getEventsByDate(date: Date | string): CalendarEvent[] {
  const dateKey = typeof date === 'string' ? date : formatDateKey(date);
  const events = getEvents();
  return events.filter(e => e.date === dateKey).sort((a, b) => {
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });
}

export function getDatesWithEvents(): Set<string> {
  const events = getEvents();
  return new Set(events.map(e => e.date));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
