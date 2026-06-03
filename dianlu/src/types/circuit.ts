export type Direction = 0 | 1 | 2 | 3;

export type CircuitType =
  | 'straight'
  | 'corner'
  | 'tee'
  | 'cross'
  | 'source'
  | 'target';

export interface CircuitCellData {
  type: CircuitType;
  rotation: number;
  isPowered: boolean;
  row: number;
  col: number;
}

export interface LevelConfig {
  level: number;
  gridSize: number;
  sourcePosition: [number, number];
  targetPosition: [number, number];
  minShuffles: number;
}

export interface GameState {
  level: number;
  gridSize: number;
  grid: CircuitCellData[][];
  moves: number;
  isComplete: boolean;
  sourcePosition: [number, number];
  targetPosition: [number, number];
}
