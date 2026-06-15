import { useEffect, useState } from 'react';
import { Difficulty, DIFFICULTY_CONFIG, getNextDifficulty } from '../utils/cardGenerator';
import { formatTime, calculateStars, getBestScore } from '../utils/formatters';
import { Star, Trophy, ArrowRight, RotateCcw, Home } from 'lucide-react';

interface VictoryModalProps {
  difficulty: Difficulty;
  moves: number;
  matches: number;
  totalPairs: number;
  score: number;
  elapsedTime: number;
  onRestart: () => void;
  onHome: () => void;
  onNextLevel: () => void;
  hasNextLevel: boolean;
}

interface ConfettiPiece {
  id: number;
  left: string;
  delay: string;
  duration: string;
  color: string;
  size: string;
}

const CONFETTI_COLORS = ['#00f5ff', '#ff00ff', '#00ff88', '#ffff00', '#ff6b35', '#b967ff'];

export function VictoryModal({
  difficulty,
  moves,
  matches,
  totalPairs,
  score,
  elapsedTime,
  onRestart,
  onHome,
  onNextLevel,
  hasNextLevel,
}: VictoryModalProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const stars = calculateStars(moves, totalPairs);
  const bestScore = getBestScore(difficulty);
  const isNewRecord = score >= bestScore && score > 0;
  const nextDiff = getNextDifficulty(difficulty);

  useEffect(() => {
    const pieces: ConfettiPiece[] = [];
    for (let i = 0; i < 60; i++) {
      pieces.push({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 2}s`,
        duration: `${2 + Math.random() * 2}s`,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: `${6 + Math.random() * 8}px`,
      });
    }
    setConfetti(pieces);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute top-0 animate-confetti"
          style={{
            left: piece.left,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            boxShadow: `0 0 ${piece.size}px ${piece.color}`,
          }}
        />
      ))}

      <div className="relative w-full max-w-md animate-float">
        <div className="bg-gradient-to-br from-neon-bg-mid via-neon-bg-light to-neon-bg
          rounded-3xl border-2 border-neon-cyan/50
          shadow-[0_0_60px_rgba(0,245,255,0.3),inset_0_0_60px_rgba(0,245,255,0.05)]
          p-6 sm:p-8 scanlines overflow-hidden">

          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
              bg-neon-yellow/10 border border-neon-yellow/50 mb-4">
              <Trophy size={20} className="text-neon-yellow" />
              <span className="font-pixel text-xs sm:text-sm neon-text-yellow">
                胜利！
              </span>
            </div>

            <h2 className="font-pixel text-xl sm:text-2xl md:text-3xl neon-text-green mb-2 leading-relaxed">
              MISSION
            </h2>
            <h2 className="font-pixel text-xl sm:text-2xl md:text-3xl neon-text-cyan mb-4 leading-relaxed">
              COMPLETE
            </h2>

            <div className="flex justify-center gap-2 sm:gap-3 mb-4">
              {[1, 2, 3].map((starNum) => (
                <Star
                  key={starNum}
                  size={32}
                  className={`transition-all duration-500 ${
                    starNum <= stars
                      ? 'text-neon-yellow fill-neon-yellow drop-shadow-[0_0_10px_#ffff00]'
                      : 'text-white/20'
                  }`}
                  style={{
                    animationDelay: `${starNum * 0.2}s`,
                    animation: starNum <= stars ? 'pop 0.5s ease-out forwards' : undefined,
                  }}
                />
              ))}
            </div>

            <div className="font-mono text-sm sm:text-base text-neon-pink/80">
              {DIFFICULTY_CONFIG[difficulty].label}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <ResultCard label="步数" value={moves.toString()} color="cyan" />
            <ResultCard label="配对" value={`${matches}/${totalPairs}`} color="green" />
            <ResultCard label="用时" value={formatTime(elapsedTime)} color="pink" />
            <ResultCard
              label="得分"
              value={score.toString()}
              color="yellow"
              highlight={isNewRecord}
            />
          </div>

          {isNewRecord && (
            <div className="text-center mb-6 p-3 rounded-xl bg-neon-yellow/10 border border-neon-yellow/50
              animate-pulse">
              <span className="font-pixel text-xs sm:text-sm neon-text-yellow">
                🎉 新纪录！NEW RECORD!
              </span>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {hasNextLevel && nextDiff && (
              <button
                onClick={onNextLevel}
                className="w-full glass-btn flex items-center justify-center gap-2
                  px-6 py-3 rounded-xl font-pixel text-xs sm:text-sm
                  border-neon-green/50 hover:border-neon-green
                  hover:shadow-[0_0_20px_rgba(0,255,136,0.4)]
                  text-neon-green transition-all duration-300
                  active:scale-95"
              >
                <span>下一关 {DIFFICULTY_CONFIG[nextDiff].label}</span>
                <ArrowRight size={16} />
              </button>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onRestart}
                className="glass-btn flex items-center justify-center gap-2
                  px-4 py-3 rounded-xl font-mono text-xs sm:text-sm
                  text-neon-cyan transition-all duration-300
                  active:scale-95"
              >
                <RotateCcw size={16} />
                <span>重玩</span>
              </button>

              <button
                onClick={onHome}
                className="glass-btn glass-btn-pink flex items-center justify-center gap-2
                  px-4 py-3 rounded-xl font-mono text-xs sm:text-sm
                  text-neon-pink transition-all duration-300
                  active:scale-95"
              >
                <Home size={16} />
                <span>主菜单</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ResultCardProps {
  label: string;
  value: string;
  color: 'cyan' | 'green' | 'pink' | 'yellow';
  highlight?: boolean;
}

function ResultCard({ label, value, color, highlight }: ResultCardProps) {
  const colorClasses = {
    cyan: 'border-neon-cyan/30 text-neon-cyan',
    green: 'border-neon-green/30 text-neon-green',
    pink: 'border-neon-pink/30 text-neon-pink',
    yellow: 'border-neon-yellow/30 text-neon-yellow',
  };

  return (
    <div className={`
      p-3 sm:p-4 rounded-xl bg-white/5 border ${colorClasses[color]}
      ${highlight ? 'animate-pulse bg-neon-yellow/10' : ''}
      text-center
    `}>
      <div className="font-mono text-[10px] sm:text-xs text-white/50 mb-1">{label}</div>
      <div className="font-pixel text-sm sm:text-lg">{value}</div>
    </div>
  );
}
