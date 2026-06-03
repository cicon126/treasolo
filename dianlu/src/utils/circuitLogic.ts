import type { CircuitCellData, CircuitType, Direction } from '@/types/circuit';

const CIRCUIT_CONNECTIONS: Record<CircuitType, Direction[]> = {
  straight: [0, 2],
  corner: [0, 1],
  tee: [0, 1, 2],
  cross: [0, 1, 2, 3],
  source: [0, 1, 2, 3],
  target: [0, 1, 2, 3],
};

export function getConnections(cell: CircuitCellData): Direction[] {
  const baseConnections = CIRCUIT_CONNECTIONS[cell.type];
  const rotationSteps = Math.floor(cell.rotation / 90) % 4;
  return baseConnections.map((dir) => ((dir + rotationSteps) % 4) as Direction);
}

export function getOppositeDirection(dir: Direction): Direction {
  return ((dir + 2) % 4) as Direction;
}

export function getNeighborPosition(
  row: number,
  col: number,
  dir: Direction
): [number, number] {
  const deltaRow = [-1, 0, 1, 0];
  const deltaCol = [0, 1, 0, -1];
  return [row + deltaRow[dir], col + deltaCol[dir]];
}

export function checkCircuitConnectivity(
  grid: CircuitCellData[][],
  sourceRow: number,
  sourceCol: number
): Set<string> {
  const gridSize = grid.length;
  const powered = new Set<string>();
  const queue: [number, number][] = [[sourceRow, sourceCol]];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const [row, col] = queue.shift()!;
    const key = `${row},${col}`;

    if (visited.has(key)) continue;
    visited.add(key);

    const cell = grid[row]?.[col];
    if (!cell) continue;

    powered.add(key);

    const connections = getConnections(cell);

    for (const dir of connections) {
      const [neighborRow, neighborCol] = getNeighborPosition(row, col, dir);

      if (neighborRow < 0 || neighborRow >= gridSize || neighborCol < 0 || neighborCol >= gridSize) {
        continue;
      }

      const neighborKey = `${neighborRow},${neighborCol}`;
      if (visited.has(neighborKey)) continue;

      const neighbor = grid[neighborRow][neighborCol];
      const neighborConnections = getConnections(neighbor);
      const oppositeDir = getOppositeDirection(dir);

      if (neighborConnections.includes(oppositeDir)) {
        queue.push([neighborRow, neighborCol]);
      }
    }
  }

  return powered;
}

export function updatePoweredState(
  grid: CircuitCellData[][],
  sourcePosition: [number, number]
): CircuitCellData[][] {
  const powered = checkCircuitConnectivity(grid, sourcePosition[0], sourcePosition[1]);

  return grid.map((row) =>
    row.map((cell) => ({
      ...cell,
      isPowered: powered.has(`${cell.row},${cell.col}`),
    }))
  );
}

export function rotateCell(cell: CircuitCellData): CircuitCellData {
  return {
    ...cell,
    rotation: (cell.rotation + 90) % 360,
  };
}

export function isLevelComplete(
  grid: CircuitCellData[][],
  targetPosition: [number, number]
): boolean {
  const targetCell = grid[targetPosition[0]]?.[targetPosition[1]];
  return targetCell?.isPowered ?? false;
}
