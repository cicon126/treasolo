import React from 'react';
import { useGameStore } from '@/store/useGameStore';

const formatNumber = (num: number): string => {
  return String(Math.max(-99, Math.min(999, num))).padStart(3, '0');
};

const StatusBar: React.FC = () => {
  const { minesLeft, timeElapsed, status, resetGame } = useGameStore();

  const getFaceEmoji = () => {
    switch (status) {
      case 'won':
        return '😎';
      case 'lost':
        return '😵';
      default:
        return '�';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'won':
        return '胜利!';
      case 'lost':
        return '失败';
      case 'playing':
        return '重开';
      default:
        return '开始';
    }
  };

  const getButtonStyles = () => {
    switch (status) {
      case 'won':
        return 'from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 shadow-emerald-500/50';
      case 'lost':
        return 'from-red-400 to-red-600 hover:from-red-300 hover:to-red-500 shadow-red-500/50';
      default:
        return 'from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 shadow-amber-500/50';
    }
  };

  return (
    <div className="flex items-center justify-between bg-slate-400 p-3 border-t-2 border-l-2 border-slate-200 border-r-2 border-b-2 border-r-slate-600 border-b-slate-600 gap-3">
      <div className="bg-black px-3 py-2 font-mono text-2xl text-red-500 shadow-inner border border-red-900/50 rounded">
        {formatNumber(minesLeft)}
      </div>
      <button
        onClick={resetGame}
        className={`
          flex flex-col items-center justify-center gap-0.5
          px-5 py-2 min-w-[80px]
          text-3xl bg-gradient-to-b
          border-t-2 border-l-2 border-white/60
          border-r-3 border-b-3 border-r-black/40 border-b-black/40
          hover:scale-105 hover:shadow-lg
          active:border-t-black/40 active:border-l-black/40
          active:border-r-white/60 active:border-b-white/60
          active:scale-95
          transition-all duration-150
          shadow-lg
          ${getButtonStyles()}
        `}
      >
        <span className="drop-shadow-md leading-none">{getFaceEmoji()}</span>
        <span className="text-xs font-bold text-white/90 drop-shadow-sm tracking-wide">
          {getStatusLabel()}
        </span>
      </button>
      <div className="bg-black px-3 py-2 font-mono text-2xl text-red-500 shadow-inner border border-red-900/50 rounded">
        {formatNumber(timeElapsed)}
      </div>
    </div>
  );
};

export default StatusBar;
