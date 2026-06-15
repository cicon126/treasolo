import { Difficulty, DIFFICULTY_CONFIG } from '../utils/cardGenerator';
import { formatTime, getBestScore } from '../utils/formatters';

interface StatusBarProps {
  difficulty: Difficulty;
  moves: number;
  matches: number;
  totalPairs: number;
  score: number;
  elapsedTime: number;
}

export function StatusBar({
  difficulty,
  moves,
  matches,
  totalPairs,
  score,
  elapsedTime,
}: StatusBarProps) {
  const bestScore = getBestScore(difficulty);
  const progress = (matches / totalPairs) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto mb-4 sm:mb-6 relative z-10">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-neon-cyan/30 p-3 sm:p-5 scanlines">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="font-pixel text-xs sm:text-sm neon-text-pink">
            {DIFFICULTY_CONFIG[difficulty].label}
          </div>
          {bestScore > 0 && (
            <div className="font-mono text-xs sm:text-sm text-neon-yellow/80">
              🏆 最佳: <span className="neon-text-yellow">{bestScore}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-3 sm:mb-4">
          <StatItem label="步数" value={moves.toString()} color="cyan" />
          <StatItem label="配对" value={`${matches}/${totalPairs}`} color="green" />
          <StatItem label="用时" value={formatTime(elapsedTime)} color="pink" />
          <StatItem label="得分" value={score.toString()} color="yellow" />
        </div>

        <div className="relative h-2 sm:h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #00f5ff 0%, #ff00ff 50%, #00ff88 100%)',
              boxShadow: '0 0 10px rgba(0, 245, 255, 0.5)',
            }}
          />
          <div
            className="absolute inset-y-0 left-0 rounded-full opacity-50 animate-pulse"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #00f5ff 0%, #ff00ff 100%)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

interface StatItemProps {
  label: string;
  value: string;
  color: 'cyan' | 'green' | 'pink' | 'yellow';
}

function StatItem({ label, value, color }: StatItemProps) {
  const colorMap = {
    cyan: 'neon-text-cyan',
    green: 'neon-text-green',
    pink: 'neon-text-pink',
    yellow: 'neon-text-yellow',
  };

  return (
    <div className="text-center p-2 sm:p-3 rounded-xl bg-white/5 border border-white/10">
      <div className="font-mono text-[10px] sm:text-xs text-white/50 mb-1">
        {label}
      </div>
      <div className={`font-pixel text-sm sm:text-lg ${colorMap[color]}`}>
        {value}
      </div>
    </div>
  );
}
