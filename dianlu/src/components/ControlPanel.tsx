import { useGameStore } from '@/store/useGameStore';
import { RefreshCw, SkipForward, ChevronLeft, ChevronRight } from 'lucide-react';

export function ControlPanel() {
  const { resetLevel, nextLevel, goToLevel, level, isComplete } = useGameStore();

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <button
        onClick={() => goToLevel(level - 1)}
        disabled={level <= 1}
        className="flex items-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/20"
      >
        <ChevronLeft className="w-5 h-5" />
        <span>上一关</span>
      </button>

      <button
        onClick={resetLevel}
        className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/30"
      >
        <RefreshCw className="w-5 h-5" />
        <span>重新开始</span>
      </button>

      {isComplete && (
        <button
          onClick={nextLevel}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-green-500/30 animate-pulse"
        >
          <SkipForward className="w-5 h-5" />
          <span>下一关</span>
        </button>
      )}

      <button
        onClick={nextLevel}
        disabled={isComplete}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 ${
          isComplete
            ? 'bg-slate-600 opacity-50 cursor-not-allowed text-slate-400'
            : 'bg-slate-700 hover:bg-slate-600 text-white hover:shadow-lg hover:shadow-cyan-500/20'
        }`}
      >
        <span>跳过</span>
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
