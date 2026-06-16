export type GemType = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

export interface Gem {
  id: string;
  type: GemType;
  row: number;
  col: number;
  isMatched: boolean;
  isNew: boolean;
  isFalling: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export interface GameState {
  board: Gem[][];
  score: number;
  selectedGem: Position | null;
  isAnimating: boolean;
  matchedCount: number;
  combo: number;
}

export const BOARD_SIZE = 8;
export const GEM_TYPES: GemType[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
