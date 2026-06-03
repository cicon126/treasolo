import { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { CircuitGrid } from '@/components/CircuitGrid';
import { StatusBar } from '@/components/StatusBar';
import { ControlPanel } from '@/components/ControlPanel';
import { Zap, Lightbulb } from 'lucide-react';

export function GamePage() {
  const initializeLevel = useGameStore((state) => state.initializeLevel);

  useEffect(() => {
    initializeLevel(1);
  }, [initializeLevel]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-2xl">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-green-400 bg-clip-text text-transparent mb-2">
            电路连通模拟器
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            旋转电路方块，使电流从电源流向指示灯
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-red-500" />
            <span>电源</span>
          </div>
          <div className="w-px h-4 bg-slate-600" />
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-green-500" />
            <span>目标</span>
          </div>
          <div className="w-px h-4 bg-slate-600" />
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-slate-600 rounded" />
            <span>点击旋转</span>
          </div>
        </div>

        <StatusBar />

        <CircuitGrid maxSize={420} />

        <ControlPanel />

        <div className="text-center text-slate-500 text-xs sm:text-sm">
          <p>💡 提示：点击电路方块可以旋转方向，连通所有电路即可通关</p>
        </div>
      </div>
    </div>
  );
}
