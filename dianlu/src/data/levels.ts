import type { LevelConfig } from '@/types/circuit';

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    gridSize: 3,
    sourcePosition: [0, 0],
    targetPosition: [2, 2],
    minShuffles: 5,
  },
  {
    level: 2,
    gridSize: 3,
    sourcePosition: [0, 1],
    targetPosition: [2, 1],
    minShuffles: 6,
  },
  {
    level: 3,
    gridSize: 3,
    sourcePosition: [1, 0],
    targetPosition: [1, 2],
    minShuffles: 7,
  },
  {
    level: 4,
    gridSize: 4,
    sourcePosition: [0, 0],
    targetPosition: [3, 3],
    minShuffles: 10,
  },
  {
    level: 5,
    gridSize: 4,
    sourcePosition: [0, 2],
    targetPosition: [3, 1],
    minShuffles: 12,
  },
  {
    level: 6,
    gridSize: 4,
    sourcePosition: [1, 0],
    targetPosition: [2, 3],
    minShuffles: 14,
  },
  {
    level: 7,
    gridSize: 5,
    sourcePosition: [0, 0],
    targetPosition: [4, 4],
    minShuffles: 18,
  },
  {
    level: 8,
    gridSize: 5,
    sourcePosition: [0, 2],
    targetPosition: [4, 2],
    minShuffles: 20,
  },
  {
    level: 9,
    gridSize: 5,
    sourcePosition: [2, 0],
    targetPosition: [2, 4],
    minShuffles: 22,
  },
  {
    level: 10,
    gridSize: 6,
    sourcePosition: [0, 0],
    targetPosition: [5, 5],
    minShuffles: 28,
  },
];

export function getLevelConfig(level: number): LevelConfig {
  const index = Math.min(level - 1, LEVELS.length - 1);
  if (level > LEVELS.length) {
    const baseLevel = LEVELS[LEVELS.length - 1];
    return {
      level,
      gridSize: Math.min(baseLevel.gridSize + Math.floor((level - LEVELS.length) / 2), 8),
      sourcePosition: [0, 0] as [number, number],
      targetPosition: [Math.min(baseLevel.gridSize + Math.floor((level - LEVELS.length) / 2), 8) - 1, Math.min(baseLevel.gridSize + Math.floor((level - LEVELS.length) / 2), 8) - 1] as [number, number],
      minShuffles: baseLevel.minShuffles + (level - LEVELS.length) * 3,
    };
  }
  return LEVELS[index];
}
