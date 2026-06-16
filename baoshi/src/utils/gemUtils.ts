import { Gem, GemType, Position, BOARD_SIZE, GEM_TYPES } from '@/types/game';

let gemIdCounter = 0;

export function generateGemId(): string {
  gemIdCounter += 1;
  return `gem-${Date.now()}-${gemIdCounter}`;
}

export function getRandomGemType(): GemType {
  return GEM_TYPES[Math.floor(Math.random() * GEM_TYPES.length)];
}

export function createGem(row: number, col: number, type?: GemType): Gem {
  return {
    id: generateGemId(),
    type: type || getRandomGemType(),
    row,
    col,
    isMatched: false,
    isNew: false,
    isFalling: false,
  };
}

export function createInitialBoard(): Gem[][] {
  const board: Gem[][] = [];
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      let gem: Gem;
      do {
        gem = createGem(row, col);
      } while (hasInitialMatch(board, gem, row, col));
      board[row][col] = gem;
    }
  }
  
  return board;
}

function hasInitialMatch(board: Gem[][], gem: Gem, row: number, col: number): boolean {
  if (col >= 2) {
    if (board[row][col - 1]?.type === gem.type && board[row][col - 2]?.type === gem.type) {
      return true;
    }
  }
  
  if (row >= 2) {
    if (board[row - 1]?.[col]?.type === gem.type && board[row - 2]?.[col]?.type === gem.type) {
      return true;
    }
  }
  
  return false;
}

export function isAdjacent(pos1: Position, pos2: Position): boolean {
  const rowDiff = Math.abs(pos1.row - pos2.row);
  const colDiff = Math.abs(pos1.col - pos2.col);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

export function swapGems(board: Gem[][], pos1: Position, pos2: Position): Gem[][] {
  const newBoard = board.map(row => row.map(gem => ({ ...gem })));
  
  const temp = { ...newBoard[pos1.row][pos1.col] };
  newBoard[pos1.row][pos1.col] = {
    ...newBoard[pos2.row][pos2.col],
    row: pos1.row,
    col: pos1.col,
  };
  newBoard[pos2.row][pos2.col] = {
    ...temp,
    row: pos2.row,
    col: pos2.col,
  };
  
  return newBoard;
}

export function findMatches(board: Gem[][]): Position[] {
  const matches: Set<string> = new Set();
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE - 2; col++) {
      const type = board[row][col].type;
      if (board[row][col + 1].type === type && board[row][col + 2].type === type) {
        let endCol = col + 2;
        while (endCol + 1 < BOARD_SIZE && board[row][endCol + 1].type === type) {
          endCol++;
        }
        for (let c = col; c <= endCol; c++) {
          matches.add(`${row},${c}`);
        }
      }
    }
  }
  
  for (let col = 0; col < BOARD_SIZE; col++) {
    for (let row = 0; row < BOARD_SIZE - 2; row++) {
      const type = board[row][col].type;
      if (board[row + 1][col].type === type && board[row + 2][col].type === type) {
        let endRow = row + 2;
        while (endRow + 1 < BOARD_SIZE && board[endRow + 1][col].type === type) {
          endRow++;
        }
        for (let r = row; r <= endRow; r++) {
          matches.add(`${r},${col}`);
        }
      }
    }
  }
  
  return Array.from(matches).map(key => {
    const [row, col] = key.split(',').map(Number);
    return { row, col };
  });
}

export function markMatched(board: Gem[][], matches: Position[]): Gem[][] {
  const newBoard = board.map(row => row.map(gem => ({ ...gem })));
  
  for (const pos of matches) {
    newBoard[pos.row][pos.col].isMatched = true;
  }
  
  return newBoard;
}

export function dropGems(board: Gem[][]): Gem[][] {
  const newBoard = board.map(row => row.map(gem => ({ ...gem, isFalling: false })));
  
  for (let col = 0; col < BOARD_SIZE; col++) {
    let writeRow = BOARD_SIZE - 1;
    
    for (let row = BOARD_SIZE - 1; row >= 0; row--) {
      if (!newBoard[row][col].isMatched) {
        if (writeRow !== row) {
          newBoard[writeRow][col] = {
            ...newBoard[row][col],
            row: writeRow,
            isFalling: true,
          };
        }
        writeRow--;
      }
    }
    
    for (let row = writeRow; row >= 0; row--) {
      newBoard[row][col] = {
        ...createGem(row, col),
        isNew: true,
        isFalling: true,
      };
    }
  }
  
  return newBoard;
}

export function calculateScore(matches: Position[], combo: number): number {
  const baseScore = matches.length * 10;
  const comboMultiplier = 1 + (combo - 1) * 0.5;
  return Math.floor(baseScore * comboMultiplier);
}

export function hasValidMoves(board: Gem[][]): boolean {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (col < BOARD_SIZE - 1) {
        const swapped = swapGems(board, { row, col }, { row, col: col + 1 });
        if (findMatches(swapped).length > 0) {
          return true;
        }
      }
      if (row < BOARD_SIZE - 1) {
        const swapped = swapGems(board, { row, col }, { row: row + 1, col });
        if (findMatches(swapped).length > 0) {
          return true;
        }
      }
    }
  }
  return false;
}
