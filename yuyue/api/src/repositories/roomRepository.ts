import db from '../db/index.js';
import { Room, CreateRoomRequest, UpdateRoomRequest } from '../../../shared/types.js';

function mapRowToRoom(row: any): Room {
  return {
    id: row.id,
    name: row.name,
    capacity: row.capacity,
    location: row.location,
    equipment: JSON.parse(row.equipment),
    description: row.description,
    createdAt: row.createdAt
  };
}

export function findAll(): Room[] {
  const rows = db.prepare('SELECT * FROM rooms ORDER BY name').all();
  return rows.map(mapRowToRoom);
}

export function findById(id: number): Room | null {
  const row = db.prepare('SELECT * FROM rooms WHERE id = ?').get(id);
  return row ? mapRowToRoom(row) : null;
}

export function create(data: CreateRoomRequest): Room {
  const stmt = db.prepare(`
    INSERT INTO rooms (name, capacity, location, equipment, description)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    data.name,
    data.capacity,
    data.location,
    JSON.stringify(data.equipment),
    data.description
  );
  
  return findById(result.lastInsertRowid as number)!;
}

export function update(id: number, data: UpdateRoomRequest): Room | null {
  const fields: string[] = [];
  const values: any[] = [];
  
  if (data.name !== undefined) {
    fields.push('name = ?');
    values.push(data.name);
  }
  if (data.capacity !== undefined) {
    fields.push('capacity = ?');
    values.push(data.capacity);
  }
  if (data.location !== undefined) {
    fields.push('location = ?');
    values.push(data.location);
  }
  if (data.equipment !== undefined) {
    fields.push('equipment = ?');
    values.push(JSON.stringify(data.equipment));
  }
  if (data.description !== undefined) {
    fields.push('description = ?');
    values.push(data.description);
  }
  
  if (fields.length === 0) {
    return findById(id);
  }
  
  values.push(id);
  
  const stmt = db.prepare(`
    UPDATE rooms SET ${fields.join(', ')} WHERE id = ?
  `);
  
  stmt.run(...values);
  return findById(id);
}

export function remove(id: number): boolean {
  const stmt = db.prepare('DELETE FROM rooms WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export function existsByName(name: string, excludeId?: number): boolean {
  let sql = 'SELECT COUNT(*) as count FROM rooms WHERE name = ?';
  const params: any[] = [name];
  
  if (excludeId !== undefined) {
    sql += ' AND id != ?';
    params.push(excludeId);
  }
  
  const result = db.prepare(sql).get(...params) as { count: number };
  return result.count > 0;
}
