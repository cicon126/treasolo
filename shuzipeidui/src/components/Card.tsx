import { Card as CardType } from '../utils/cardGenerator';

interface CardProps {
  card: CardType;
  index: number;
  onClick: (index: number) => void;
  isMismatched: boolean;
}

const CONTENT_COLORS = [
  'text-neon-cyan',
  'text-neon-pink',
  'text-neon-yellow',
  'text-neon-green',
  'text-neon-orange',
  'text-neon-purple',
];

export function Card({ card, index, onClick, isMismatched }: CardProps) {
  const isFlipped = card.isFlipped || card.isMatched;
  const colorClass = CONTENT_COLORS[card.pairId % CONTENT_COLORS.length];

  return (
    <div
      className={`card-container cursor-pointer select-none aspect-square ${
        isMismatched ? 'animate-shake' : ''
      }`}
      onClick={() => onClick(index)}
    >
      <div className={`card-inner ${isFlipped ? 'card-flipped' : ''}`}>
        <div
          className={`card-face card-back overflow-hidden scanlines
            bg-gradient-to-br from-neon-bg-mid to-neon-bg-light
            border-2 border-neon-cyan/40
            hover:border-neon-cyan hover:shadow-[0_0_15px_rgba(0,245,255,0.4)]
            transition-all duration-300
          `}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg border-2 border-neon-cyan/50
              bg-neon-cyan/5 flex items-center justify-center
              shadow-[inset_0_0_10px_rgba(0,245,255,0.1)]">
              <span className="text-neon-cyan text-xl sm:text-2xl md:text-3xl font-bold opacity-60">?</span>
            </div>
          </div>
          <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-neon-cyan/30"></div>
          <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-neon-pink/30"></div>
          <div className="absolute bottom-1 left-1 w-2 h-2 rounded-full bg-neon-pink/30"></div>
          <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-neon-cyan/30"></div>
        </div>

        <div
          className={`card-face card-front overflow-hidden scanlines
            ${card.isMatched
              ? 'bg-gradient-to-br from-neon-green/20 to-neon-cyan/20 border-neon-green animate-glow-green'
              : 'bg-gradient-to-br from-neon-bg-light to-neon-bg-mid border-neon-pink/60'
            }
            border-2
          `}
          style={{
            animation: card.isMatched ? undefined : isMismatched ? undefined : isFlipped ? 'pop 0.4s ease-out' : undefined,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center p-1">
            <span
              className={`
                ${colorClass}
                text-2xl sm:text-3xl md:text-4xl lg:text-5xl
                font-bold
                drop-shadow-[0_0_8px_currentColor]
                ${card.isMatched ? 'animate-pulse' : ''}
              `}
            >
              {card.content}
            </span>
          </div>
          {card.isMatched && (
            <div className="absolute top-1 right-1 text-xs text-neon-green drop-shadow-[0_0_4px_#00ff88]">
              ✓
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
