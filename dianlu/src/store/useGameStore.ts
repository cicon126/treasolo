import { create } from 'zustand';
import type { CircuitCellData, GameState } from '@/types/circuit';
import { getLevelConfig } from '@/data/levels';
import { generateLevel, shuffleLevel } from '@/utils/levelGenerator';
import { rotateCell, updatePoweredState, isLevelComplete } from '@/utils/circuitLogic';

interface GameStore extends GameState {
  initializeLevel: (level: number) => void;
  rotateCell: (row: number, col: number) => void;
  resetLevel: () => void;
  nextLevel: () => void;
  goToLevel: (level: number) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  level: 1,
  gridSize: 3,
  grid: [],
  moves: 0,
  isComplete: false,
  sourcePosition: [0, 0],
  targetPosition: [2, 2],

  initializeLevel: (level: number) => {
    const config = getLevelConfig(level);
    let grid = generateLevel(config);
    grid = shuffleLevel(grid, config.minShuffles, config.sourcePosition);
    grid = updatePoweredState(grid, config.sourcePosition);

    set({
      level,
      gridSize: config.gridSize,
      grid,
      moves: 0,
      isComplete: false,
      sourcePosition: config.sourcePosition,
      targetPosition: config.targetPosition,
    });
  },

  rotateCell: (row: number, col: number) => {
    const state = get();
    if (state.isComplete) return;

    const cell = state.grid[row]?.[col];
    if (!cell || cell.type === 'source' || cell.type === 'target') return;

    const newGrid = state.grid.map((r) => r.map((c) => ({ ...c })));
    newGrid[row][col] = rotateCell(cell);

    const poweredGrid = updatePoweredState(newGrid, state.sourcePosition);
    const complete = isLevelComplete(poweredGrid, state.targetPosition);

    set({
      grid: poweredGrid,
      moves: state.moves + 1,
      isComplete: complete,
    });
  },

  resetLevel: () => {
    const state = get();
    state.initializeLevel(state.level);
  },

  nextLevel: () => {
    const state = get();
    state.initializeLevel(state.level + 1);
  },

  goToLevel: (level: number) => {
    const state = get();
    state.initializeLevel(Math.max(1, level));
  },
}));
