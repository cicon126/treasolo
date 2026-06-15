export interface Card {
  id: number;
  pairId: number;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export type Difficulty = '4x4' | '6x6' | '8x8';

export interface DifficultyConfig {
  rows: number;
  cols: number;
  totalPairs: number;
  label: string;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  '4x4': { rows: 4, cols: 4, totalPairs: 8, label: '简单 4×4' },
  '6x6': { rows: 6, cols: 6, totalPairs: 18, label: '中等 6×6' },
  '8x8': { rows: 8, cols: 8, totalPairs: 32, label: '困难 8×8' },
};

const CARD_CONTENTS = [
  '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧',
  '⑨', '⑩', '⑪', '⑫', '⑬', '⑭', '⑮', '⑯',
  '⑰', '⑱', '⑲', '⑳', '㉑', '㉒', '㉓', '㉔',
  '㉕', '㉖', '㉗', '㉘', '㉙', '㉚', '㉛', '㉜',
  '★', '●', '▲', '■', '◆', '♥', '♦', '♣',
  '♠', '☀', '☾', '⚡', '✿', '❄', '☯', '☘',
];

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generateCards(difficulty: Difficulty): Card[] {
  const config = DIFFICULTY_CONFIG[difficulty];
  const { totalPairs } = config;

  const selectedContents = shuffleArray(CARD_CONTENTS).slice(0, totalPairs);

  const cards: Card[] = [];
  let id = 0;

  selectedContents.forEach((content, pairId) => {
    cards.push({
      id: id++,
      pairId,
      content,
      isFlipped: false,
      isMatched: false,
    });
    cards.push({
      id: id++,
      pairId,
      content,
      isFlipped: false,
      isMatched: false,
    });
  });

  return shuffleArray(cards);
}

export function getNextDifficulty(current: Difficulty): Difficulty | null {
  const order: Difficulty[] = ['4x4', '6x6', '8x8'];
  const currentIndex = order.indexOf(current);
  return currentIndex < order.length - 1 ? order[currentIndex + 1] : null;
}
