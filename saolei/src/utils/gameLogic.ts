import type { Cell, Difficulty } from '@/types/game';

export const createEmptyBoard = (rows: number, cols: number): Cell[][] => {
  const board: Cell[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        row: r,
        col: c,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0,
      });
    }
    board.push(row);
  }
  return board;
};

const getNeighbors = (row: number, col: number, rows: number, cols: number): [number, number][] => {
  const neighbors: [number, number][] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        neighbors.push([nr, nc]);
      }
    }
  }
  return neighbors;
};

export const placeMines = (
  board: Cell[][],
  mineCount: number,
  safeRow: number,
  safeCol: number
): Cell[][] => {
  const rows = board.length;
  const cols = board[0].length;
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));

  const safeZone = new Set<string>();
  safeZone.add(`${safeRow},${safeCol}`);
  const neighbors = getNeighbors(safeRow, safeCol, rows, cols);
  neighbors.forEach(([r, c]) => safeZone.add(`${r},${c}`));

  let placed = 0;
  while (placed < mineCount) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!newBoard[r][c].isMine && !safeZone.has(`${r},${c}`)) {
      newBoard[r][c].isMine = true;
      placed++;
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!newBoard[r][c].isMine) {
        const count = getNeighbors(r, c, rows, cols).filter(
          ([nr, nc]) => newBoard[nr][nc].isMine
        ).length;
        newBoard[r][c].adjacentMines = count;
      }
    }
  }

  return newBoard;
};

export const revealCell = (
  board: Cell[][],
  row: number,
  col: number
): Cell[][] => {
  const rows = board.length;
  const cols = board[0].length;
  const newBoard = board.map(r => r.map(cell => ({ ...cell })));

  if (newBoard[row][col].isRevealed || newBoard[row][col].isFlagged) {
    return newBoard;
  }

  const queue: [number, number][] = [[row, col]];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    const key = `${r},${c}`;
    if (visited.has(key)) continue;
    visited.add(key);

    if (newBoard[r][c].isRevealed || newBoard[r][c].isFlagged) continue;

    newBoard[r][c].isRevealed = true;

    if (newBoard[r][c].adjacentMines === 0 && !newBoard[r][c].isMine) {
      const neighbors = getNeighbors(r, c, rows, cols);
      for (const [nr, nc] of neighbors) {
        if (!visited.has(`${nr},${nc}`) && !newBoard[nr][nc].isRevealed) {
          queue.push([nr, nc]);
        }
      }
    }
  }

  return newBoard;
};

export const revealAllMines = (board: Cell[][]): Cell[][] => {
  return board.map(row =>
    row.map(cell => ({
      ...cell,
      isRevealed: cell.isMine ? true : cell.isRevealed,
    }))
  );
};

export const toggleFlag = (board: Cell[][], row: number, col: number): Cell[][] => {
  const newBoard = board.map(r => r.map(cell => ({ ...cell })));
  if (!newBoard[row][col].isRevealed) {
    newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;
  }
  return newBoard;
};

export const checkWin = (board: Cell[][]): boolean => {
  for (const row of board) {
    for (const cell of row) {
      if (!cell.isMine && !cell.isRevealed) {
        return false;
      }
    }
  }
  return true;
};

export const countFlags = (board: Cell[][]): number => {
  let count = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell.isFlagged) count++;
    }
  }
  return count;
};

export const initBoard = (difficulty: Difficulty): Cell[][] => {
  return createEmptyBoard(difficulty.rows, difficulty.cols);
};
