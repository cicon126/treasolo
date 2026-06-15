export type Difficulty = 3 | 4 | 5;

export interface Tile {
  id: number;
  currentIndex: number;
  isEmpty: boolean;
}

export interface BestRecord {
  size: Difficulty;
  moves: number;
  time: number;
  date: string;
}

export interface GameState {
  tiles: Tile[];
  size: Difficulty;
  moves: number;
  startTime: number | null;
  elapsedTime: number;
  isPlaying: boolean;
  isCompleted: boolean;
  imageUrl: string;
  moveHistory: number[][];
  bestRecords: BestRecord[];
  showPreview: boolean;
}

export type GameAction =
  | { type: 'SET_DIFFICULTY'; payload: Difficulty }
  | { type: 'SET_IMAGE'; payload: string }
  | { type: 'SHUFFLE' }
  | { type: 'MOVE_TILE'; payload: number }
  | { type: 'UNDO' }
  | { type: 'RESET' }
  | { type: 'TICK' }
  | { type: 'COMPLETE' }
  | { type: 'TOGGLE_PREVIEW'; payload: boolean }
  | { type: 'LOAD_RECORDS'; payload: BestRecord[] };
