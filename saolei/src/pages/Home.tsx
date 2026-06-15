import React from 'react';
import DifficultySelector from '@/components/DifficultySelector';
import StatusBar from '@/components/StatusBar';
import GameBoard from '@/components/GameBoard';
import { useGameStore } from '@/store/useGameStore';

const Home: React.FC = () => {
  const { status } = useGameStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6 tracking-wider">
        💣 扫雷游戏
      </h1>

      <DifficultySelector />

      <div
        className="
          inline-block p-2 bg-slate-400
          border-t-4 border-l-4 border-slate-300 border-r-4 border-b-4 border-r-slate-700 border-b-slate-700
          shadow-2xl
        "
      >
        <div className="mb-2">
          <StatusBar />
        </div>
        <GameBoard />
      </div>

      {(status === 'won' || status === 'lost') && (
        <div
          className={`
            mt-6 px-6 py-3 rounded-lg text-xl font-bold shadow-lg
            ${status === 'won'
              ? 'bg-green-500 text-white animate-bounce'
              : 'bg-red-500 text-white animate-pulse'
            }
          `}
        >
          {status === 'won' ? '🎉 恭喜你赢了！' : '💥 游戏结束！'}
        </div>
      )}

      <div className="mt-6 text-slate-400 text-sm text-center">
        <p>左键点击揭开格子 | 右键点击标记旗帜</p>
        <p className="mt-1">数字表示周围8格内的地雷数量</p>
      </div>
    </div>
  );
};

export default Home;
