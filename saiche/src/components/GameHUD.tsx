import { Pause, Play } from 'lucide-react';
import { useEffect, useState } from 'react';

interface GameHUDProps {
  score: number;
  speed: number;
  level: number;
  isPaused: boolean;
  onPause: () => void;
}

export default function GameHUD({ score, speed, level, isPaused, onPause }: GameHUDProps) {
  const [displayScore, setDisplayScore] = useState(score);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (score !== displayScore) {
      setIsAnimating(true);
      setDisplayScore(score);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [score, displayScore]);

  const getSpeedColor = () => {
    if (level <= 3) return { bg: '#00f5ff', glow: 'rgba(0, 245, 255, 0.6)' };
    if (level <= 6) return { bg: '#ffff00', glow: 'rgba(255, 255, 0, 0.6)' };
    return { bg: '#ff0055', glow: 'rgba(255, 0, 85, 0.6)' };
  };

  const speedColor = getSpeedColor();
  const speedPercent = Math.min((speed / 300) * 100, 100);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none">
      <div className="flex justify-between items-start gap-4 max-w-7xl mx-auto">
        <div className="glass-panel rounded-xl px-5 py-3 md:px-7 md:py-4 pointer-events-auto neon-border-cyan">
          <div className="flex flex-col items-start">
            <p
              className={`font-orbitron font-bold neon-text-cyan ${isAnimating ? 'animate-score-pop' : ''}`}
              style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', lineHeight: 1 }}
            >
              {displayScore.toLocaleString()}
            </p>
            <p className="text-gray-400 text-xs md:text-sm tracking-widest mt-1">得分</p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <div className="glass-panel rounded-xl px-4 py-3 md:px-6 md:py-4 pointer-events-auto neon-border-cyan">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-300 text-xs md:text-sm font-medium tracking-wider">速度</span>
                <span
                  className="font-orbitron font-bold"
                  style={{ color: speedColor.bg, fontSize: 'clamp(0.8rem, 2vw, 1.1rem)' }}
                >
                  Lv.{level}
                </span>
              </div>
              <div className="w-32 md:w-48 h-3 md:h-4 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${speedPercent}%`,
                    backgroundColor: speedColor.bg,
                    boxShadow: `0 0 10px ${speedColor.glow}, inset 0 0 5px rgba(255,255,255,0.3)`,
                  }}
                />
              </div>
            </div>
          </div>

          <button
            onClick={onPause}
            className="glass-panel rounded-xl p-3 md:p-4 pointer-events-auto cursor-pointer
                       hover:bg-slate-700/60 transition-all active:scale-95 neon-border-cyan
                       hover:shadow-[0_0_20px_rgba(0,245,255,0.4)]"
          >
            {isPaused ? (
              <Play className="w-5 h-5 md:w-6 md:h-6 neon-text-green fill-none" strokeWidth={2.5} />
            ) : (
              <Pause className="w-5 h-5 md:w-6 md:h-6 neon-text-cyan fill-none" strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
