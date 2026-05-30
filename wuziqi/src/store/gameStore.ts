import { create } from "zustand";

export type CellValue = 0 | 1 | 2;
export type Winner = 0 | 1 | 2;

export interface Position {
  row: number;
  col: number;
}

const BOARD_SIZE = 15;

const createEmptyBoard = (): CellValue[][] =>
  Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0) as CellValue[]);

interface WinLine {
  positions: Position[];
}

interface GameState {
  board: CellValue[][];
  currentPlayer: 1 | 2;
  winner: Winner;
  winLine: WinLine | null;
  playerScore: number;
  aiScore: number;
  drawCount: number;
  isThinking: boolean;
  gameOver: boolean;
  lastMove: Position | null;
  moveHistory: Position[];
  playerPiece: 1 | 2;
  aiPiece: 1 | 2;
  playerFirst: boolean;

  placeStone: (row: number, col: number) => void;
  resetGame: () => void;
  resetScores: () => void;
  setPlayerFirst: (first: boolean) => void;
}

const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

function checkWin(board: CellValue[][], row: number, col: number, player: CellValue): WinLine | null {
  for (const [dr, dc] of DIRECTIONS) {
    const positions: Position[] = [{ row, col }];
    for (let i = 1; i < 5; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || board[r][c] !== player) break;
      positions.push({ row: r, col: c });
    }
    for (let i = 1; i < 5; i++) {
      const r = row - dr * i;
      const c = col - dc * i;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || board[r][c] !== player) break;
      positions.push({ row: r, col: c });
    }
    if (positions.length >= 5) return { positions };
  }
  return null;
}

function isBoardFull(board: CellValue[][]): boolean {
  return board.every((row) => row.every((cell) => cell !== 0));
}

function getValidMoves(board: CellValue[][]): Position[] {
  const moves: Position[] = [];
  const visited = new Set<string>();
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== 0) {
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            const key = `${nr},${nc}`;
            if (
              nr >= 0 && nr < BOARD_SIZE &&
              nc >= 0 && nc < BOARD_SIZE &&
              board[nr][nc] === 0 &&
              !visited.has(key)
            ) {
              visited.add(key);
              moves.push({ row: nr, col: nc });
            }
          }
        }
      }
    }
  }
  return moves;
}

function evaluatePosition(board: CellValue[][], row: number, col: number, aiPiece: CellValue): number {
  let score = 0;
  const opponent: CellValue = aiPiece === 1 ? 2 : 1;

  for (const [dr, dc] of DIRECTIONS) {
    let count = 1;
    let openEnds = 0;
    let blocked = 0;

    for (let i = 1; i <= 4; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) { blocked++; break; }
      if (board[r][c] === aiPiece) count++;
      else if (board[r][c] === 0) { openEnds++; break; }
      else { blocked++; break; }
    }

    for (let i = 1; i <= 4; i++) {
      const r = row - dr * i;
      const c = col - dc * i;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) { blocked++; break; }
      if (board[r][c] === aiPiece) count++;
      else if (board[r][c] === 0) { openEnds++; break; }
      else { blocked++; break; }
    }

    if (count >= 5) score += 100000;
    else if (count === 4) {
      if (openEnds >= 1) score += 10000;
      else if (blocked < 2) score += 1000;
    } else if (count === 3) {
      if (openEnds >= 2) score += 5000;
      else if (openEnds >= 1) score += 500;
    } else if (count === 2) {
      if (openEnds >= 2) score += 200;
      else if (openEnds >= 1) score += 50;
    } else if (count === 1) {
      if (openEnds >= 2) score += 10;
    }
  }

  board[row][col] = opponent;
  for (const [dr, dc] of DIRECTIONS) {
    let count = 1;
    let openEnds = 0;
    let blocked = 0;

    for (let i = 1; i <= 4; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) { blocked++; break; }
      if (board[r][c] === opponent) count++;
      else if (board[r][c] === 0) { openEnds++; break; }
      else { blocked++; break; }
    }

    for (let i = 1; i <= 4; i++) {
      const r = row - dr * i;
      const c = col - dc * i;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) { blocked++; break; }
      if (board[r][c] === opponent) count++;
      else if (board[r][c] === 0) { openEnds++; break; }
      else { blocked++; break; }
    }

    if (count >= 5) score += 90000;
    else if (count === 4) {
      if (openEnds >= 1) score += 9000;
      else if (blocked < 2) score += 900;
    } else if (count === 3) {
      if (openEnds >= 2) score += 4500;
      else if (openEnds >= 1) score += 450;
    } else if (count === 2) {
      if (openEnds >= 2) score += 150;
      else if (openEnds >= 1) score += 30;
    }
  }
  board[row][col] = 0;

  return score;
}

function aiMove(board: CellValue[][], aiPiece: CellValue): Position {
  const validMoves = getValidMoves(board);

  if (validMoves.length === 0) {
    return { row: 7, col: 7 };
  }

  let bestScore = -1;
  let bestMoves: Position[] = [];

  for (const move of validMoves) {
    const score = evaluatePosition(board, move.row, move.col, aiPiece);
    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

function triggerAiMove(set: (partial: Partial<GameState>) => void, get: () => GameState) {
  setTimeout(() => {
    const state = get();
    const move = aiMove(state.board, state.aiPiece);
    const aiBoard = state.board.map((r) => [...r]);
    aiBoard[move.row][move.col] = state.aiPiece;

    const aiWinResult = checkWin(aiBoard, move.row, move.col, state.aiPiece);
    if (aiWinResult) {
      set({
        board: aiBoard,
        winner: state.aiPiece,
        winLine: aiWinResult,
        gameOver: true,
        isThinking: false,
        lastMove: move,
        moveHistory: [...state.moveHistory, move],
        aiScore: state.aiScore + 1,
      });
      return;
    }

    if (isBoardFull(aiBoard)) {
      set({
        board: aiBoard,
        gameOver: true,
        drawCount: state.drawCount + 1,
        isThinking: false,
        lastMove: move,
        moveHistory: [...state.moveHistory, move],
      });
      return;
    }

    set({
      board: aiBoard,
      currentPlayer: state.playerPiece,
      isThinking: false,
      lastMove: move,
      moveHistory: [...state.moveHistory, move],
    });
  }, 300);
}

export const useGameStore = create<GameState>((set, get) => ({
  board: createEmptyBoard(),
  currentPlayer: 1,
  winner: 0,
  winLine: null,
  playerScore: 0,
  aiScore: 0,
  drawCount: 0,
  isThinking: false,
  gameOver: false,
  lastMove: null,
  moveHistory: [],
  playerPiece: 1,
  aiPiece: 2,
  playerFirst: true,

  placeStone: (row: number, col: number) => {
    const state = get();
    if (state.board[row][col] !== 0 || state.gameOver || state.isThinking || state.currentPlayer !== state.playerPiece) {
      return;
    }

    const newBoard = state.board.map((r) => [...r]);
    newBoard[row][col] = state.playerPiece;

    const winResult = checkWin(newBoard, row, col, state.playerPiece);
    if (winResult) {
      set({
        board: newBoard,
        winner: state.playerPiece,
        winLine: winResult,
        gameOver: true,
        lastMove: { row, col },
        moveHistory: [...state.moveHistory, { row, col }],
        playerScore: state.playerScore + 1,
      });
      return;
    }

    if (isBoardFull(newBoard)) {
      set({
        board: newBoard,
        gameOver: true,
        drawCount: state.drawCount + 1,
        lastMove: { row, col },
        moveHistory: [...state.moveHistory, { row, col }],
      });
      return;
    }

    set({
      board: newBoard,
      currentPlayer: state.aiPiece,
      isThinking: true,
      lastMove: { row, col },
      moveHistory: [...state.moveHistory, { row, col }],
    });

    triggerAiMove(set, get);
  },

  resetGame: () => {
    const state = get();
    const playerPiece: 1 | 2 = state.playerFirst ? 1 : 2;
    const aiPiece: 1 | 2 = state.playerFirst ? 2 : 1;

    set({
      board: createEmptyBoard(),
      currentPlayer: 1,
      winner: 0,
      winLine: null,
      isThinking: false,
      gameOver: false,
      lastMove: null,
      moveHistory: [],
      playerPiece,
      aiPiece,
    });

    if (!state.playerFirst) {
      set({ isThinking: true });
      triggerAiMove(set, get);
    }
  },

  resetScores: () => {
    set({
      playerScore: 0,
      aiScore: 0,
      drawCount: 0,
    });
  },

  setPlayerFirst: (first: boolean) => {
    set({ playerFirst: first });
  },
}));
