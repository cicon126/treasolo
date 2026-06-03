import { useGameStore } from '@/store/useGameStore';
import { Trophy, RotateCcw, Grid3X3 } from 'lucide-react';

export function StatusBar() {
  const { level, gridSize, moves, isComplete } = useGameStore();

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 p-4 bg-slate-800/50 rounded-xl backdrop-blur-sm border border-slate-700">
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <span className="text-slate-400 text-sm">关卡</span>
        <span className="text-2xl font-bold text-cyan-400">{level}</span>
      </div>

      <div className="w-px h-8 bg-slate-600" />

      <div className="flex items-center gap-2">
        <Grid3X3 className="w-5 h-5 text-cyan-500" />
        <span className="text-slate-400 text-sm">网格</span>
        <span className="text-2xl font-bold text-cyan-400">{gridSize}×{gridSize}</span>
      </div>

      <div className="w-px h-8 bg-slate-600" />

      <div className="flex items-center gap-2">
        <RotateCcw className="w-5 h-5 text-orange-500" />
        <span className="text-slate-400 text-sm">步数</span>
        <span className="text-2xl font-bold text-cyan-400">{moves}</span>
      </div>

      {isComplete && (
        <>
          <div className="w-px h-8 bg-slate-600" />
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-lg border border-green-500/50 animate-pulse">
            <span className="text-green-400 font-bold">🎉 通关成功！</span>
          </div>
        </>
      )}
    </div>
  );
}
