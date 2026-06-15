import { Card as CardType, Difficulty, DIFFICULTY_CONFIG } from '../utils/cardGenerator';
import { Card } from './Card';

interface GameBoardProps {
  cards: CardType[];
  difficulty: Difficulty;
  mismatchedCards: number[];
  onCardClick: (index: number) => void;
}

export function GameBoard({ cards, difficulty, mismatchedCards, onCardClick }: GameBoardProps) {
  const config = DIFFICULTY_CONFIG[difficulty];

  const gapClasses: Record<Difficulty, string> = {
    '4x4': 'gap-2 sm:gap-3 md:gap-4',
    '6x6': 'gap-1.5 sm:gap-2 md:gap-3',
    '8x8': 'gap-1 sm:gap-1.5 md:gap-2',
  };

  const gridCols: Record<Difficulty, string> = {
    '4x4': 'grid-cols-4',
    '6x6': 'grid-cols-6',
    '8x8': 'grid-cols-8',
  };

  const maxWidthClasses: Record<Difficulty, string> = {
    '4x4': 'max-w-xl',
    '6x6': 'max-w-2xl',
    '8x8': 'max-w-4xl',
  };

  return (
    <div className="w-full mx-auto relative z-10">
      <div className={`grid ${gridCols[difficulty]} ${gapClasses[difficulty]} ${maxWidthClasses[difficulty]} mx-auto
        p-3 sm:p-5 rounded-3xl
        bg-white/5 backdrop-blur-md
        border border-neon-cyan/20
        shadow-[0_0_40px_rgba(0,245,255,0.1),inset_0_0_40px_rgba(0,245,255,0.03)]
        grid-bg
      `}>
        {cards.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            index={index}
            onClick={onCardClick}
            isMismatched={mismatchedCards.includes(index)}
          />
        ))}
      </div>

      <div className="flex justify-between mt-4 px-2">
        <div className="w-8 h-1 rounded-full bg-gradient-to-r from-neon-cyan to-transparent" />
        <div className="w-8 h-1 rounded-full bg-gradient-to-l from-neon-pink to-transparent" />
      </div>
    </div>
  );
}
