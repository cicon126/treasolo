import type { Tile, Difficulty } from '../types/game';

export function createSolvedTiles(size: Difficulty): Tile[] {
  const total = size * size;
  return Array.from({ length: total }, (_, i) => ({
    id: i,
    currentIndex: i,
    isEmpty: i === total - 1,
  }));
}

export function getEmptyIndex(tiles: Tile[]): number {
  const empty = tiles.find(t => t.isEmpty);
  return empty ? empty.currentIndex : -1;
}

export function getTileAt(tiles: Tile[], index: number): Tile | undefined {
  return tiles.find(t => t.currentIndex === index);
}

function getAdjacentIndices(index: number, size: Difficulty): number[] {
  const row = Math.floor(index / size);
  const col = index % size;
  const adjacent: number[] = [];

  if (row > 0) adjacent.push(index - size);
  if (row < size - 1) adjacent.push(index + size);
  if (col > 0) adjacent.push(index - 1);
  if (col < size - 1) adjacent.push(index + 1);

  return adjacent;
}

export function isAdjacent(index1: number, index2: number, size: Difficulty): boolean {
  const row1 = Math.floor(index1 / size);
  const col1 = index1 % size;
  const row2 = Math.floor(index2 / size);
  const col2 = index2 % size;

  const rowDiff = Math.abs(row1 - row2);
  const colDiff = Math.abs(col1 - col2);

  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

export function canMoveTile(tiles: Tile[], tileId: number, size: Difficulty): boolean {
  const tile = tiles.find(t => t.id === tileId);
  if (!tile || tile.isEmpty) return false;

  const emptyIndex = getEmptyIndex(tiles);
  return isAdjacent(tile.currentIndex, emptyIndex, size);
}

export function moveTile(tiles: Tile[], tileId: number, size: Difficulty): Tile[] | null {
  const tile = tiles.find(t => t.id === tileId);
  if (!tile || tile.isEmpty) return null;

  const emptyIndex = getEmptyIndex(tiles);
  if (!isAdjacent(tile.currentIndex, emptyIndex, size)) return null;

  const tileIndex = tile.currentIndex;
  return tiles.map(t => {
    if (t.id === tileId) return { ...t, currentIndex: emptyIndex };
    if (t.isEmpty) return { ...t, currentIndex: tileIndex };
    return t;
  });
}

export function shuffleTiles(size: Difficulty): Tile[] {
  const tiles = createSolvedTiles(size);
  const shuffleCount = size * size * 30;
  let currentTiles = [...tiles];

  for (let i = 0; i < shuffleCount; i++) {
    const emptyIndex = getEmptyIndex(currentTiles);
    const adjacent = getAdjacentIndices(emptyIndex, size);
    const randomAdjacent = adjacent[Math.floor(Math.random() * adjacent.length)];
    const tileToMove = getTileAt(currentTiles, randomAdjacent);

    if (tileToMove && !tileToMove.isEmpty) {
      const result = moveTile(currentTiles, tileToMove.id, size);
      if (result) currentTiles = result;
    }
  }

  if (isSolved(currentTiles)) {
    return shuffleTiles(size);
  }

  return currentTiles;
}

export function isSolved(tiles: Tile[]): boolean {
  return tiles.every(t => t.id === t.currentIndex);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}
