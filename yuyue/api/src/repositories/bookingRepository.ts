import db from '../db/index.js';
import { Booking, CreateBookingRequest, CheckAvailabilityRequest } from '../../../shared/types.js';

function mapRowToBooking(row: any): Booking {
  return {
    id: row.id,
    roomId: row.roomId,
    roomName: row.roomName,
    meetingName: row.meetingName,
    date: row.date,
    startTime: row.startTime,
    endTime: row.endTime,
    organizer: row.organizer,
    attendees: row.attendees,
    createdAt: row.createdAt
  };
}

export function findAll(date?: string, roomId?: number): Booking[] {
  let sql = `
    SELECT b.*, r.name as roomName
    FROM bookings b
    LEFT JOIN rooms r ON b.roomId = r.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (date) {
    sql += ' AND b.date = ?';
    params.push(date);
  }
  if (roomId) {
    sql += ' AND b.roomId = ?';
    params.push(roomId);
  }

  sql += ' ORDER BY b.date, b.startTime';

  const rows = db.prepare(sql).all(...params);
  return rows.map(mapRowToBooking);
}

export function findById(id: number): Booking | null {
  const row = db.prepare(`
    SELECT b.*, r.name as roomName
    FROM bookings b
    LEFT JOIN rooms r ON b.roomId = r.id
    WHERE b.id = ?
  `).get(id);
  
  return row ? mapRowToBooking(row) : null;
}

export function findByRoomAndDate(roomId: number, date: string): Booking[] {
  const rows = db.prepare(`
    SELECT b.*, r.name as roomName
    FROM bookings b
    LEFT JOIN rooms r ON b.roomId = r.id
    WHERE b.roomId = ? AND b.date = ?
    ORDER BY b.startTime
  `).all(roomId, date);
  
  return rows.map(mapRowToBooking);
}

export function create(data: CreateBookingRequest): Booking {
  const roomStmt = db.prepare('SELECT name FROM rooms WHERE id = ?');
  const room = roomStmt.get(data.roomId) as { name: string } | undefined;
  
  const stmt = db.prepare(`
    INSERT INTO bookings (roomId, meetingName, date, startTime, endTime, organizer, attendees)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    data.roomId,
    data.meetingName,
    data.date,
    data.startTime,
    data.endTime,
    data.organizer,
    data.attendees || 1
  );
  
  return findById(result.lastInsertRowid as number)!;
}

export function remove(id: number): boolean {
  const stmt = db.prepare('DELETE FROM bookings WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export function checkAvailability(params: CheckAvailabilityRequest): Booking[] {
  const { roomId, date, startTime, endTime, excludeBookingId } = params;
  
  let sql = `
    SELECT b.*, r.name as roomName
    FROM bookings b
    LEFT JOIN rooms r ON b.roomId = r.id
    WHERE b.roomId = ?
      AND b.date = ?
      AND b.id != ?
      AND (
        (b.startTime < ? AND b.endTime > ?)
        OR (b.startTime < ? AND b.endTime > ?)
        OR (b.startTime >= ? AND b.endTime <= ?)
      )
  `;
  
  const sqlParams = [
    roomId,
    date,
    excludeBookingId || 0,
    endTime,
    startTime,
    endTime,
    startTime,
    startTime,
    endTime
  ];
  
  const rows = db.prepare(sql).all(...sqlParams);
  return rows.map(mapRowToBooking);
}
