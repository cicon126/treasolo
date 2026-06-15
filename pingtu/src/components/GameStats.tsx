import React, { useEffect, useRef } from 'react';
import { Move, Clock, Trophy, Grid3X3 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { formatTime } from '../game/logic';

export const GameStats: React.FC = () => {
  const { moves, elapsedTime, size, isPlaying, dispatch, bestRecords } = useGameStore();
  const prevTimeRef = useRef(elapsedTime);

  useEffect(() => {
    let interval: number | undefined;
    if (isPlaying) {
      interval = window.setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, dispatch]);

  useEffect(() => {
    prevTimeRef.current = elapsedTime;
  }, [elapsedTime]);

  const sizeRecords = bestRecords.filter(r => r.size === size);
  const bestRecord = sizeRecords[0];
  const difficultyLabel = size === 3 ? '简单 3×3' : size === 4 ? '中等 4×4' : '困难 5×5';

  return (
    <div className="flex flex-wrap justify-center gap-3 md:gap-4 animate-fade-up">
      <div className="stat-card flex items-center gap-2">
        <Grid3X3 className="w-5 h-5 text-accent shrink-0" />
        <div className="text-left">
          <div className="text-[10px] uppercase tracking-wider text-gray-400">难度</div>
          <div className="font-display font-bold text-white">{difficultyLabel}</div>
        </div>
      </div>

      <div className="stat-card flex items-center gap-2">
        <Move className="w-5 h-5 text-primary-400 shrink-0" />
        <div className="text-left">
          <div className="text-[10px] uppercase tracking-wider text-gray-400">步数</div>
          <div
            className={`font-mono font-bold text-white tabular-nums
                       ${prevTimeRef.current !== elapsedTime ? 'animate-[fade-up_0.2s]' : ''}`}
          >
            {moves}
          </div>
        </div>
      </div>

      <div className="stat-card flex items-center gap-2">
        <Clock className="w-5 h-5 text-warn shrink-0" />
        <div className="text-left">
          <div className="text-[10px] uppercase tracking-wider text-gray-400">用时</div>
          <div
            className={`font-mono font-bold text-white tabular-nums
                       ${prevTimeRef.current !== elapsedTime ? 'animate-[fade-up_0.2s]' : ''}`}
          >
            {formatTime(elapsedTime)}
          </div>
        </div>
      </div>

      <div className="stat-card flex items-center gap-2">
        <Trophy className="w-5 h-5 text-success shrink-0" />
        <div className="text-left">
          <div className="text-[10px] uppercase tracking-wider text-gray-400">最佳</div>
          <div className="font-mono font-bold text-white text-sm">
            {bestRecord
              ? `${bestRecord.moves}步 ${formatTime(bestRecord.time)}`
              : '暂无记录'}
          </div>
        </div>
      </div>
    </div>
  );
};
