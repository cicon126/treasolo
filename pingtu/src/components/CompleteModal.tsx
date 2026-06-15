import React, { useEffect, useMemo, useState } from 'react';
import { Trophy, Star, Clock, Move, PartyPopper, RefreshCw } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { formatTime } from '../game/logic';

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotation: number;
}

export const CompleteModal: React.FC = () => {
  const { isCompleted, moves, elapsedTime, size, bestRecords, dispatch } = useGameStore();
  const [visible, setVisible] = useState(false);

  const confetti = useMemo<ConfettiPiece[]>(() => {
    const colors = ['#2dd4bf', '#f59e0b', '#fb7185', '#6366f1', '#a78bfa', '#34d399'];
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 10,
      rotation: Math.random() * 360,
    }));
  }, [isCompleted]);

  useEffect(() => {
    if (isCompleted) {
      const timer = setTimeout(() => setVisible(true), 300);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [isCompleted]);

  if (!isCompleted) return null;

  const sizeRecords = bestRecords.filter(r => r.size === size);
  const currentRank = sizeRecords.findIndex(
    r => r.moves === moves && r.time === elapsedTime
  ) + 1;
  const isNewRecord = currentRank === 1;

  const handlePlayAgain = () => {
    setVisible(false);
    setTimeout(() => dispatch({ type: 'SHUFFLE' }), 200);
  };

  const handleReset = () => {
    setVisible(false);
    setTimeout(() => dispatch({ type: 'RESET' }), 200);
  };

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        transition-opacity duration-300
        ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {visible && confetti.map(c => (
        <div
          key={c.id}
          className="absolute top-0 animate-confetti rounded-sm z-10"
          style={{
            left: `${c.left}%`,
            width: c.size,
            height: c.size * 0.6,
            backgroundColor: c.color,
            animationDelay: `${c.delay}s`,
            animationDuration: `${c.duration}s`,
            transform: `rotate(${c.rotation}deg)`,
          }}
        />
      ))}

      <div
        className={`
          relative glass-card p-8 w-full max-w-sm text-center z-20
          ${visible ? 'animate-bounce-in' : ''}
        `}
      >
        {isNewRecord && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5
                        rounded-full bg-gradient-to-r from-warn to-yellow-400
                        text-slate-900 text-sm font-bold flex items-center gap-1.5
                        shadow-lg shadow-warn/30">
            <Star className="w-4 h-4 fill-current" />
            新纪录！
          </div>
        )}

        <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br
                      from-accent via-primary-400 to-success flex items-center justify-center
                      animate-float shadow-xl shadow-accent/30">
          <PartyPopper className="w-10 h-10 text-white" />
        </div>

        <h2 className="text-2xl font-display font-bold text-white mb-1">
          恭喜完成！
        </h2>
        <p className="text-gray-400 mb-6">
          你成功复原了 {size}×{size} 拼图
        </p>

        <div className="grid grid-cols-2 gap-3 mb-7">
          <div className="stat-card">
            <div className="flex items-center justify-center gap-1.5 mb-1 text-gray-400">
              <Move className="w-4 h-4 text-primary-400" />
              <span className="text-xs uppercase tracking-wider">总步数</span>
            </div>
            <div className="font-mono font-bold text-2xl text-white tabular-nums">
              {moves}
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-center gap-1.5 mb-1 text-gray-400">
              <Clock className="w-4 h-4 text-warn" />
              <span className="text-xs uppercase tracking-wider">用时</span>
            </div>
            <div className="font-mono font-bold text-2xl text-white tabular-nums">
              {formatTime(elapsedTime)}
            </div>
          </div>
        </div>

        {currentRank > 0 && currentRank <= 3 && (
          <div className="flex items-center justify-center gap-2 mb-6 px-4 py-2.5
                        rounded-xl bg-warn/10 border border-warn/20">
            <Trophy className="w-5 h-5 text-warn" />
            <span className="text-warn font-semibold">
              排行榜第 {currentRank} 名
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleReset}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            返回设置
          </button>
          <button
            onClick={handlePlayAgain}
            className="btn-accent flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            再来一局
          </button>
        </div>
      </div>
    </div>
  );
};
