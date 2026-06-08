export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Point {
  x: number;
  y: number;
}

export interface LevelConfig {
  level: number;
  speed: number;
  targetScore: number;
  obstacles: Point[];
  gridSize: number;
  lives: number;
}

function generateObstacles(gridSize: number, count: number, excludeCenter: number = 3): Point[] {
  const obstacles: Point[] = [];
  const center = Math.floor(gridSize / 2);
  const used = new Set<string>();

  while (obstacles.length < count) {
    const x = Math.floor(Math.random() * gridSize);
    const y = Math.floor(Math.random() * gridSize);
    const key = `${x},${y}`;
    if (used.has(key)) continue;
    if (Math.abs(x - center) < excludeCenter && Math.abs(y - center) < excludeCenter) continue;
    if (x === 0 || y === 0 || x === gridSize - 1 || y === gridSize - 1) continue;
    used.add(key);
    obstacles.push({ x, y });
  }
  return obstacles;
}

export const LEVELS: LevelConfig[] = [
  { level: 1, speed: 200, targetScore: 50, obstacles: [], gridSize: 20, lives: 3 },
  { level: 2, speed: 180, targetScore: 80, obstacles: generateObstacles(20, 2), gridSize: 20, lives: 3 },
  { level: 3, speed: 160, targetScore: 120, obstacles: generateObstacles(20, 4), gridSize: 20, lives: 3 },
  { level: 4, speed: 140, targetScore: 160, obstacles: generateObstacles(20, 6), gridSize: 20, lives: 2 },
  { level: 5, speed: 120, targetScore: 200, obstacles: generateObstacles(22, 8), gridSize: 22, lives: 2 },
  { level: 6, speed: 100, targetScore: 260, obstacles: generateObstacles(22, 10), gridSize: 22, lives: 2 },
  { level: 7, speed: 90, targetScore: 320, obstacles: generateObstacles(24, 14), gridSize: 24, lives: 2 },
  { level: 8, speed: 80, targetScore: 400, obstacles: generateObstacles(24, 18), gridSize: 24, lives: 1 },
  { level: 9, speed: 70, targetScore: 500, obstacles: generateObstacles(26, 24), gridSize: 26, lives: 1 },
  { level: 10, speed: 60, targetScore: 650, obstacles: generateObstacles(26, 30), gridSize: 26, lives: 1 },
];

export const FOOD_SCORE = 10;
