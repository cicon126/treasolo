import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { DIFFICULTIES } from '@/types/game';

const DifficultySelector: React.FC = () => {
  const { difficulty, setDifficulty } = useGameStore();

  return (
    <div className="flex gap-2 mb-4">
      {DIFFICULTIES.map((d) => (
        <button
          key={d.name}
          onClick={() => setDifficulty(d)}
          className={`
            px-4 py-2 text-sm font-bold transition-all duration-150
            ${difficulty.name === d.name
              ? 'bg-gradient-to-br from-slate-500 to-slate-600 text-white border-t-2 border-l-2 border-slate-700 border-r-2 border-b-2 border-r-slate-300 border-b-slate-300'
              : 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800 border-t-2 border-l-2 border-slate-200 border-r-2 border-b-2 border-r-slate-600 border-b-slate-600 hover:from-slate-200 hover:to-slate-300'
            }
          `}
        >
          {d.name}
        </button>
      ))}
    </div>
  );
};

export default DifficultySelector;
