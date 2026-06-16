import { Gem as GemType } from '@/types/game';

interface GemProps {
  gem: GemType;
  isSelected: boolean;
  onClick: () => void;
  cellSize: number;
}

const gemColors: Record<string, { from: string; to: string; glow: string }> = {
  red: { from: '#ff6b6b', to: '#ee5a5a', glow: 'rgba(255, 107, 107, 0.6)' },
  blue: { from: '#4ecdc4', to: '#44a08d', glow: 'rgba(78, 205, 196, 0.6)' },
  green: { from: '#95e1a3', to: '#5cb85c', glow: 'rgba(149, 225, 163, 0.6)' },
  yellow: { from: '#ffe66d', to: '#f4d35e', glow: 'rgba(255, 230, 109, 0.6)' },
  purple: { from: '#a29bfe', to: '#6c5ce7', glow: 'rgba(162, 155, 254, 0.6)' },
  orange: { from: '#ffa07a', to: '#ff7f50', glow: 'rgba(255, 160, 122, 0.6)' },
};

export default function Gem({ gem, isSelected, onClick, cellSize }: GemProps) {
  const colors = gemColors[gem.type];
  const gemSize = cellSize * 0.75;
  
  return (
    <div
      className={`absolute flex items-center justify-center cursor-pointer transition-all duration-200 ease-out
        ${gem.isMatched ? 'animate-pop scale-0 opacity-0' : ''}
        ${gem.isNew ? 'animate-appear' : ''}
        ${gem.isFalling ? 'animate-fall' : ''}
      `}
      style={{
        width: cellSize,
        height: cellSize,
        left: gem.col * cellSize,
        top: gem.row * cellSize,
      }}
      onClick={onClick}
    >
      <div
        className={`rounded-full relative transition-transform duration-150 hover:scale-110
          ${isSelected ? 'animate-pulse-ring scale-110' : ''}
        `}
        style={{
          width: gemSize,
          height: gemSize,
          background: `radial-gradient(circle at 30% 30%, ${colors.from}, ${colors.to})`,
          boxShadow: isSelected
            ? `0 0 20px ${colors.glow}, 0 0 40px ${colors.glow}, inset 0 2px 4px rgba(255,255,255,0.5)`
            : `0 4px 8px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3)`,
          border: isSelected ? '3px solid white' : 'none',
        }}
      >
        <div
          className="absolute rounded-full"
          style={{
            width: gemSize * 0.35,
            height: gemSize * 0.25,
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.8), transparent)',
            top: '15%',
            left: '20%',
            transform: 'rotate(-30deg)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: gemSize * 0.15,
            height: gemSize * 0.12,
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.5), transparent)',
            bottom: '25%',
            right: '25%',
          }}
        />
      </div>
    </div>
  );
}
