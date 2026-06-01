import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'booking.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL UNIQUE,
      capacity INTEGER NOT NULL CHECK (capacity > 0),
      location VARCHAR(200) NOT NULL,
      equipment TEXT NOT NULL DEFAULT '[]',
      description TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roomId INTEGER NOT NULL,
      meetingName VARCHAR(200) NOT NULL,
      date DATE NOT NULL,
      startTime TIME NOT NULL,
      endTime TIME NOT NULL,
      organizer VARCHAR(100) NOT NULL,
      attendees INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (roomId) REFERENCES rooms(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_bookings_date_room ON bookings(date, roomId);
    CREATE INDEX IF NOT EXISTS idx_bookings_room ON bookings(roomId);
  `);

  const roomCount = db.prepare('SELECT COUNT(*) as count FROM rooms').get() as { count: number };
  if (roomCount.count === 0) {
    const insertRoom = db.prepare(`
      INSERT OR IGNORE INTO rooms (name, capacity, location, equipment, description)
      VALUES (?, ?, ?, ?, ?)
    `);

    const initialRooms: (string | number)[][] = [
      ['星辰会议室', 10, 'A座3楼301', '["投影仪","白板","视频会议系统"]', '适合中小型会议，配备高清投影设备'],
      ['云海会议室', 20, 'A座5楼501', '["投影仪","白板","音响系统","视频会议系统"]', '大型会议室，可容纳20人，适合部门会议'],
      ['灵动会议室', 6, 'B座2楼201', '["电视屏幕","白板"]', '小型讨论室，适合头脑风暴和小组讨论'],
      ['宏图会议室', 30, 'A座8楼801', '["投影仪","专业音响","视频会议系统","白板","录音设备"]', '多功能会议厅，适合全公司大会和重要客户接待']
    ];

    const transaction = db.transaction((rooms: (string | number)[][]) => {
      for (const room of rooms) {
        insertRoom.run(...room);
      }
    });

    transaction(initialRooms);
  }
}

initDatabase();

export default db;
