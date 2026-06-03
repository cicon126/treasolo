import type { CircuitCellData, CircuitType, LevelConfig } from '@/types/circuit';
import { getConnections, updatePoweredState } from './circuitLogic';

const CIRCUIT_TYPES: CircuitType[] = ['straight', 'corner', 'tee', 'cross'];

function generatePath(
  gridSize: number,
  start: [number, number],
  end: [number, number]
): [number, number][] {
  const path: [number, number][] = [[...start]];
  let current: [number, number] = [...start];
  const visited = new Set<string>();
  visited.add(`${start[0]},${start[1]}`);

  while (current[0] !== end[0] || current[1] !== end[1]) {
    const [row, col] = current;
    const neighbors: [number, number][] = [];

    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      const key = `${newRow},${newCol}`;

      if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize && !visited.has(key)) {
        neighbors.push([newRow, newCol]);
      }
    }

    if (neighbors.length === 0) break;

    neighbors.sort((a, b) => {
      const distA = Math.abs(a[0] - end[0]) + Math.abs(a[1] - end[1]);
      const distB = Math.abs(b[0] - end[0]) + Math.abs(b[1] - end[1]);
      return distA - distB;
    });

    const next = neighbors[0];
    path.push([...next]);
    visited.add(`${next[0]},${next[1]}`);
    current = [...next];
  }

  return path;
}

function getRequiredConnections(
  row: number,
  col: number,
  path: [number, number][],
  index: number
): number[] {
  const connections: number[] = [];

  if (index > 0) {
    const prev = path[index - 1];
    if (prev[0] < row) connections.push(0);
    if (prev[0] > row) connections.push(2);
    if (prev[1] < col) connections.push(3);
    if (prev[1] > col) connections.push(1);
  }

  if (index < path.length - 1) {
    const next = path[index + 1];
    if (next[0] < row) connections.push(0);
    if (next[0] > row) connections.push(2);
    if (next[1] < col) connections.push(3);
    if (next[1] > col) connections.push(1);
  }

  return connections;
}

function findMatchingCircuit(required: number[]): { type: CircuitType; rotation: number } {
  const sortedRequired = [...required].sort((a, b) => a - b).join(',');

  for (const type of CIRCUIT_TYPES) {
    for (let rotation = 0; rotation < 360; rotation += 90) {
      const testCell: CircuitCellData = {
        type,
        rotation,
        isPowered: false,
        row: 0,
        col: 0,
      };
      const connections = getConnections(testCell).sort((a, b) => a - b).join(',');

      if (connections === sortedRequired) {
        return { type, rotation };
      }
    }
  }

  return { type: 'cross', rotation: 0 };
}

export function generateLevel(config: LevelConfig): CircuitCellData[][] {
  const { gridSize, sourcePosition, targetPosition } = config;

  const grid: CircuitCellData[][] = [];

  for (let row = 0; row < gridSize; row++) {
    grid[row] = [];
    for (let col = 0; col < gridSize; col++) {
      const randomType = CIRCUIT_TYPES[Math.floor(Math.random() * CIRCUIT_TYPES.length)];
      grid[row][col] = {
        type: randomType,
        rotation: Math.floor(Math.random() * 4) * 90,
        isPowered: false,
        row,
        col,
      };
    }
  }

  const path = generatePath(gridSize, sourcePosition, targetPosition);

  for (let i = 0; i < path.length; i++) {
    const [row, col] = path[i];
    const isSource = row === sourcePosition[0] && col === sourcePosition[1];
    const isTarget = row === targetPosition[0] && col === targetPosition[1];

    if (isSource) {
      grid[row][col] = {
        type: 'source',
        rotation: 0,
        isPowered: true,
        row,
        col,
      };
    } else if (isTarget) {
      grid[row][col] = {
        type: 'target',
        rotation: 0,
        isPowered: false,
        row,
        col,
      };
    } else {
      const required = getRequiredConnections(row, col, path, i);
      const { type, rotation } = findMatchingCircuit(required);
      grid[row][col] = {
        type,
        rotation,
        isPowered: false,
        row,
        col,
      };
    }
  }

  return grid;
}

export function shuffleLevel(
  grid: CircuitCellData[][],
  minShuffles: number,
  sourcePosition: [number, number]
): CircuitCellData[][] {
  const shuffled = grid.map((row) => row.map((cell) => ({ ...cell })));
  const gridSize = shuffled.length;

  let shuffleCount = 0;
  const maxAttempts = minShuffles * 10;
  let attempts = 0;

  while (shuffleCount < minShuffles && attempts < maxAttempts) {
    const row = Math.floor(Math.random() * gridSize);
    const col = Math.floor(Math.random() * gridSize);

    if (shuffled[row][col].type === 'source' || shuffled[row][col].type === 'target') {
      attempts++;
      continue;
    }

    const originalRotation = shuffled[row][col].rotation;
    shuffled[row][col].rotation = Math.floor(Math.random() * 4) * 90;

    if (shuffled[row][col].rotation === originalRotation) {
      shuffled[row][col].rotation = (originalRotation + 90) % 360;
    }

    const testGrid = updatePoweredState(shuffled, sourcePosition);
    const targetCell = testGrid.flat().find((c) => c.type === 'target');

    if (!targetCell?.isPowered) {
      shuffleCount++;
    }

    attempts++;
  }

  return shuffled;
}
