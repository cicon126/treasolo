import { Heart, Pause, Play, RotateCcw, Trophy, Home } from 'lucide-react';

interface StatusPanelProps {
  score: number;
  targetScore: number;
  level: number;
  lives: number;
  highScore: number;
  isPaused: boolean;
  onTogglePause: () => void;
  onRetry: () => void;
  onHome: () => void;
}

export default function StatusPanel({
  score, targetScore, level, lives, highScore, isPaused, onTogglePause, onRetry, onHome,
}: StatusPanelProps) {
  const progress = Math.min(100, (score / targetScore) * 100);

  return (
    <div className="w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <div>
            <p className="text-xs text-slate-500">第 {level} 关</p>
            <p className="text-lg font-bold text-slate-800">贪吃蛇大冒险</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onHome}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 transition-colors text-slate-600"
            title="返回主菜单"
          >
            <Home className="w-5 h-5" />
          </button>
          <button
            onClick={onRetry}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 transition-colors text-slate-600"
            title="重新开始"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={onTogglePause}
            className={`p-2 rounded-xl transition-colors active:scale-95 ${isPaused
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
              }`}
            title={isPaused ? '继续游戏' : '暂停游戏'}
          >
            {isPaused ? <Play className="w-5 h-5" fill="white" /> : <Pause className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-emerald-50 to-sky-50 rounded-xl p-3 border border-emerald-100">
          <p className="text-xs text-slate-500 mb-1">当前得分</p>
          <p className="text-3xl font-extrabold text-emerald-600">{score}</p>
          <p className="text-[11px] text-slate-400">目标 {targetScore}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-100">
          <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-500" /> 最高分
          </p>
          <p className="text-3xl font-extrabold text-orange-500">{highScore}</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>通关进度</span>
          <span>{Math.floor(progress)}%</span>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-sky-400 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 mr-1">生命值</span>
        {Array.from({ length: Math.max(lives, 0) }).map((_, i) => (
          <Heart key={i} className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
        {lives === 0 && <span className="text-slate-400 text-sm">无</span>}
      </div>
    </div>
  );
}
