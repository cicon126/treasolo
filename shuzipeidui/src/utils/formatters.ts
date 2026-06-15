export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function calculateStars(moves: number, totalPairs: number): number {
  const perfectMoves = totalPairs;
  const ratio = moves / perfectMoves;

  if (ratio <= 1.5) return 3;
  if (ratio <= 2.5) return 2;
  return 1;
}

export function calculateScore(
  matches: number,
  moves: number,
  elapsedTime: number,
  totalPairs: number
): number {
  const baseScore = matches * 100;
  const movePenalty = Math.max(0, (moves - totalPairs) * 5);
  const timePenalty = Math.floor(elapsedTime / 10) * 2;
  const difficultyBonus = totalPairs * 10;

  return Math.max(0, baseScore - movePenalty - timePenalty + difficultyBonus);
}

export function getBestScore(difficulty: string): number {
  const key = `memory-match-best-${difficulty}`;
  return parseInt(localStorage.getItem(key) || '0', 10);
}

export function saveBestScore(difficulty: string, score: number): void {
  const key = `memory-match-best-${difficulty}`;
  const current = getBestScore(difficulty);
  if (score > current) {
    localStorage.setItem(key, score.toString());
  }
}
