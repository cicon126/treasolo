import { create } from 'zustand';
import type { Cell, Difficulty, GameStatus } from '@/types/game';
import { DIFFICULTIES } from '@/types/game';
import {
  initBoard,
  placeMines,
  revealCell,
  revealAllMines,
  toggleFlag,
  checkWin,
  countFlags,
} from '@/utils/gameLogic';

interface GameState {
  board: Cell[][];
  status: GameStatus;
  difficulty: Difficulty;
  minesLeft: number;
  timeElapsed: number;
  firstClick: boolean;
  timerInterval: number | null;
  setDifficulty: (difficulty: Difficulty) => void;
  startTimer: () => void;
  stopTimer: () => void;
  incrementTime: () => void;
  handleCellClick: (row: number, col: number) => void;
  handleCellRightClick: (row: number, col: number) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  board: initBoard(DIFFICULTIES[0]),
  status: 'idle',
  difficulty: DIFFICULTIES[0],
  minesLeft: DIFFICULTIES[0].mines,
  timeElapsed: 0,
  firstClick: true,
  timerInterval: null,

  setDifficulty: (difficulty: Difficulty) => {
    const { stopTimer } = get();
    stopTimer();
    set({
      board: initBoard(difficulty),
      status: 'idle',
      difficulty,
      minesLeft: difficulty.mines,
      timeElapsed: 0,
      firstClick: true,
      timerInterval: null,
    });
  },

  startTimer: () => {
    const { timerInterval } = get();
    if (timerInterval !== null) return;
    const interval = window.setInterval(() => {
      get().incrementTime();
    }, 1000);
    set({ timerInterval: interval });
  },

  stopTimer: () => {
    const { timerInterval } = get();
    if (timerInterval !== null) {
      clearInterval(timerInterval);
      set({ timerInterval: null });
    }
  },

  incrementTime: () => {
    set(state => ({
      timeElapsed: Math.min(state.timeElapsed + 1, 999),
    }));
  },

  handleCellClick: (row: number, col: number) => {
    const state = get();
    if (state.status === 'won' || state.status === 'lost') return;
    if (state.board[row][col].isFlagged) return;

    let newBoard = state.board;
    let newStatus: GameStatus = state.status;
    let firstClick = state.firstClick;

    if (state.firstClick) {
      newBoard = placeMines(state.board, state.difficulty.mines, row, col);
      firstClick = false;
      newStatus = 'playing';
      get().startTimer();
    }

    if (newBoard[row][col].isMine) {
      newBoard = revealAllMines(newBoard);
      newBoard = newBoard.map((r, ri) =>
        r.map((cell, ci) => ({
          ...cell,
          isRevealed: ri === row && ci === col ? true : cell.isRevealed,
        }))
      );
      newStatus = 'lost';
      get().stopTimer();
    } else {
      newBoard = revealCell(newBoard, row, col);
      if (checkWin(newBoard)) {
        newStatus = 'won';
        get().stopTimer();
      }
    }

    const flagCount = countFlags(newBoard);
    set({
      board: newBoard,
      status: newStatus,
      firstClick,
      minesLeft: state.difficulty.mines - flagCount,
    });
  },

  handleCellRightClick: (row: number, col: number) => {
    const state = get();
    if (state.status === 'won' || state.status === 'lost') return;
    if (state.board[row][col].isRevealed) return;

    const newBoard = toggleFlag(state.board, row, col);
    const flagCount = countFlags(newBoard);
    set({
      board: newBoard,
      minesLeft: state.difficulty.mines - flagCount,
    });
  },

  resetGame: () => {
    const state = get();
    state.stopTimer();
    set({
      board: initBoard(state.difficulty),
      status: 'idle',
      minesLeft: state.difficulty.mines,
      timeElapsed: 0,
      firstClick: true,
      timerInterval: null,
    });
  },
}));
