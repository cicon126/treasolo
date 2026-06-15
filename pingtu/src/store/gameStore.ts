import { create } from 'zustand';
import type { GameState, Difficulty, Tile, BestRecord, GameAction } from '../types/game';
import {
  createSolvedTiles,
  shuffleTiles,
  moveTile,
  isSolved,
  getEmptyIndex,
} from '../game/logic';

const STORAGE_KEY = 'puzzle-best-records';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop';

function loadRecords(): BestRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveRecords(records: BestRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {}
}

const initialState: GameState = {
  tiles: createSolvedTiles(3),
  size: 3,
  moves: 0,
  startTime: null,
  elapsedTime: 0,
  isPlaying: false,
  isCompleted: false,
  imageUrl: DEFAULT_IMAGE,
  moveHistory: [],
  bestRecords: loadRecords(),
  showPreview: false,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_DIFFICULTY': {
      if (state.isPlaying) return state;
      return {
        ...state,
        size: action.payload,
        tiles: createSolvedTiles(action.payload),
        moves: 0,
        elapsedTime: 0,
        startTime: null,
        isCompleted: false,
        moveHistory: [],
      };
    }

    case 'SET_IMAGE': {
      return {
        ...state,
        imageUrl: action.payload,
      };
    }

    case 'SHUFFLE': {
      const shuffled = shuffleTiles(state.size);
      return {
        ...state,
        tiles: shuffled,
        moves: 0,
        startTime: Date.now(),
        elapsedTime: 0,
        isPlaying: true,
        isCompleted: false,
        moveHistory: [],
      };
    }

    case 'MOVE_TILE': {
      if (state.isCompleted || !state.isPlaying) return state;

      const newTiles = moveTile(state.tiles, action.payload, state.size);
      if (!newTiles) return state;

      const solved = isSolved(newTiles);
      const emptyIdx = getEmptyIndex(state.tiles);
      const movedTile = state.tiles.find(t => t.id === action.payload);
      const newHistory = movedTile
        ? [...state.moveHistory, [action.payload, movedTile.currentIndex, emptyIdx]]
        : state.moveHistory;

      if (solved) {
        const finalTime = state.startTime
          ? Math.floor((Date.now() - state.startTime) / 1000)
          : state.elapsedTime;

        const newRecord: BestRecord = {
          size: state.size,
          moves: state.moves + 1,
          time: finalTime,
          date: new Date().toISOString(),
        };

        const updatedRecords = [...state.bestRecords, newRecord]
          .sort((a, b) => {
            if (a.size !== b.size) return a.size - b.size;
            if (a.moves !== b.moves) return a.moves - b.moves;
            return a.time - b.time;
          })
          .slice(0, 20);

        saveRecords(updatedRecords);

        return {
          ...state,
          tiles: newTiles,
          moves: state.moves + 1,
          elapsedTime: finalTime,
          isPlaying: false,
          isCompleted: true,
          moveHistory: newHistory,
          bestRecords: updatedRecords,
        };
      }

      return {
        ...state,
        tiles: newTiles,
        moves: state.moves + 1,
        moveHistory: newHistory,
      };
    }

    case 'UNDO': {
      if (state.moveHistory.length === 0 || state.isCompleted) return state;

      const lastMove = state.moveHistory[state.moveHistory.length - 1];
      const [tileId, fromIdx, toIdx] = lastMove;

      const newTiles = state.tiles.map(t => {
        if (t.id === tileId) return { ...t, currentIndex: fromIdx };
        if (t.isEmpty) return { ...t, currentIndex: toIdx };
        return t;
      });

      return {
        ...state,
        tiles: newTiles,
        moves: state.moves - 1,
        moveHistory: state.moveHistory.slice(0, -1),
      };
    }

    case 'RESET': {
      return {
        ...state,
        tiles: createSolvedTiles(state.size),
        moves: 0,
        startTime: null,
        elapsedTime: 0,
        isPlaying: false,
        isCompleted: false,
        moveHistory: [],
      };
    }

    case 'TICK': {
      if (!state.isPlaying || !state.startTime) return state;
      return {
        ...state,
        elapsedTime: Math.floor((Date.now() - state.startTime) / 1000),
      };
    }

    case 'COMPLETE': {
      return state;
    }

    case 'TOGGLE_PREVIEW': {
      return {
        ...state,
        showPreview: action.payload,
      };
    }

    case 'LOAD_RECORDS': {
      return {
        ...state,
        bestRecords: action.payload,
      };
    }

    default:
      return state;
  }
}

interface GameStore extends GameState {
  dispatch: (action: GameAction) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,
  dispatch: (action) => set((state) => gameReducer(state, action)),
}));

export { DEFAULT_IMAGE };
