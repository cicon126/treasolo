import { useEffect, useRef } from 'react';
import { ArrowRight, Home, RotateCcw, Trophy } from 'lucide-react';
import { LEVELS } from '../utils/levels';

interface ResultModalProps {
  isVictory: boolean;
  isGameOver: boolean;
  score: number;
  level: number;
  highScore: number;
  onRetry: () => void;
  onNextLevel: () => void;
  onHome: () => void;
}

export default function ResultModal({
  isVictory, isGameOver, score, level, highScore, onRetry, onNextLevel, onHome,
}: ResultModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const show = isVictory || isGameOver;
  const isLastLevel = level >= LEVELS.length;

  useEffect(() => {
    if (!show || !isVictory) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 300;
    const particles: Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string; size: number }> = [];
    const colors = ['#34d399', '#38bdf8', '#fb923c', '#fbbf24', '#f472b6', '#a78bfa'];

    function burst() {
      const cx = 200 + (Math.random() - 0.5) * 100;
      const cy = 80 + (Math.random() - 0.5) * 50;
      for (let i = 0; i < 25; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 1 + Math.random() * 3;
        particles.push({
          x: cx, y: cy,
          vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1,
          life: 60 + Math.random() * 40,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 2 + Math.random() * 3,
        });
      }
    }
    burst();
    const burstTimer = setInterval(burst, 700);

    let raf = 0;
    function frame() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.life--;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.globalAlpha = Math.min(1, p.life / 40);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    frame();

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(burstTimer);
    };
  }, [show, isVictory]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className={`relative w-full max-w-md rounded-3xl p-8 shadow-2xl animate-popIn ${isVictory
          ? 'bg-gradient-to-br from-emerald-50 via-white to-sky-50 border-4 border-emerald-200'
          : 'bg-gradient-to-br from-slate-50 via-white to-slate-100 border-4 border-slate-200'
        }`}>
        {isVictory && (
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ width: '100%', height: '100%' }} />
        )}

        <div className="relative z-10 text-center space-y-4">
          <div className="text-7xl mb-2 animate-bounce" style={{ animationDuration: '1.2s' }}>
            {isVictory ? '🎉' : '🐍'}
          </div>

          <h2 className={`text-3xl font-extrabold ${isVictory ? 'text-emerald-600' : 'text-slate-700'}`}>
            {isVictory ? '恭喜通关！' : '游戏结束'}
          </h2>

          <p className="text-slate-500">
            {isVictory
              ? `你成功完成了第 ${level} 关！`
              : '别灰心，再来一次吧！'}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-2xl p-4 ${isVictory ? 'bg-emerald-100/60' : 'bg-slate-100'}`}>
              <p className="text-xs text-slate-500">本关得分</p>
              <p className={`text-3xl font-extrabold ${isVictory ? 'text-emerald-600' : 'text-slate-700'}`}>{score}</p>
            </div>
            <div className="bg-amber-100/60 rounded-2xl p-4">
              <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                <Trophy className="w-3 h-3 text-amber-500" /> 最高分
              </p>
              <p className="text-3xl font-extrabold text-orange-500">{highScore}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {isVictory && !isLastLevel && (
              <button
                onClick={onNextLevel}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-bold text-lg shadow-lg hover:shadow-emerald-300/50 hover:scale-[1.02] active:scale-95 transition-all"
              >
                下一关 <ArrowRight className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onRetry}
              className={`flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold text-lg transition-all hover:scale-[1.02] active:scale-95 ${isVictory
                  ? 'bg-white border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                  : 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg hover:shadow-orange-300/50'
                }`}
            >
              <RotateCcw className="w-5 h-5" /> 再玩一次
            </button>
            <button
              onClick={onHome}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 active:scale-95 transition-all"
            >
              <Home className="w-5 h-5" /> 返回主菜单
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
