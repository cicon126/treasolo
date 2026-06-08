import { Lock, Play, Trophy } from 'lucide-react';
import { LEVELS } from '../utils/levels';

interface MainMenuProps {
  highScore: number;
  unlockedLevels: number[];
  onStart: (level: number) => void;
}

export default function MainMenu({ highScore, unlockedLevels, onStart }: MainMenuProps) {
  const maxUnlocked = Math.max(...unlockedLevels);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 bg-emerald-200/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-60 h-60 bg-sky-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-orange-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-xl animate-fadeIn">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-6xl animate-bounce" style={{ animationDuration: '2s' }}>🐍</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-2">
            <span className="bg-gradient-to-r from-emerald-500 via-sky-500 to-orange-400 bg-clip-text text-transparent">
              贪吃蛇大冒险
            </span>
          </h1>
          <p className="text-slate-500 text-lg">清新风格 · 关卡挑战 · 语音提示</p>
        </div>

        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-md border border-emerald-100">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span className="text-slate-700 font-semibold">最高分：</span>
          <span className="text-2xl font-bold text-emerald-600">{highScore}</span>
        </div>

        <div className="w-full bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-100 p-6">
          <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span className="text-2xl">🎯</span> 选择关卡
          </h2>
          <div className="grid grid-cols-5 gap-3">
            {LEVELS.map(lv => {
              const isUnlocked = unlockedLevels.includes(lv.level);
              return (
                <button
                  key={lv.level}
                  onClick={() => isUnlocked && onStart(lv.level)}
                  disabled={!isUnlocked}
                  className={`
                    relative aspect-square rounded-2xl flex flex-col items-center justify-center font-bold transition-all duration-200
                    ${isUnlocked
                      ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white hover:scale-105 hover:shadow-lg active:scale-95 cursor-pointer'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }
                    ${lv.level === maxUnlocked && isUnlocked ? 'ring-4 ring-orange-300 ring-offset-2' : ''}
                  `}
                >
                  {isUnlocked ? (
                    <>
                      <span className="text-2xl">{lv.level}</span>
                      <span className="text-[10px] opacity-90 mt-0.5">⭐×{lv.lives}</span>
                    </>
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => onStart(maxUnlocked)}
          className="group flex items-center gap-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white px-10 py-4 rounded-full font-bold text-xl shadow-lg hover:shadow-orange-300/50 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <Play className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" fill="white" />
          开始第 {maxUnlocked} 关
        </button>

        <div className="w-full bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-100">
          <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
            <span>🎮</span> 操作说明
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">↑↓←→</kbd>
              <span>方向键控制</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">WASD</kbd>
              <span>WASD 控制</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">空格</kbd>
              <span>暂停/继续</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">ESC</kbd>
              <span>返回菜单</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
