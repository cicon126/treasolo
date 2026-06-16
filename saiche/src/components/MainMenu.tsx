import { Trophy, Star } from 'lucide-react';

interface MainMenuProps {
  highScore: number;
  onStart: () => void;
}

export default function MainMenu({ highScore, onStart }: MainMenuProps) {
  return (
    <div className="fixed inset-0 w-full h-full bg-game-gradient flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
              animation: `blink ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10 px-6">
        <div className="text-center animate-float">
          <h1
            className="font-orbitron font-black tracking-wider mb-3 neon-text-cyan"
            style={{ fontSize: 'clamp(3rem, 10vw, 7rem)', lineHeight: 1.1 }}
          >
            极速狂飙
          </h1>
          <p
            className="font-orbitron font-semibold tracking-[0.3em] neon-text-pink"
            style={{ fontSize: 'clamp(1rem, 2.5vw, 1.5rem)' }}
          >
            赛车躲避挑战
          </p>
        </div>

        <div className="relative neon-border-gold rounded-2xl p-6 glass-panel min-w-[280px]">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-1">
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]" />
            <Trophy className="w-7 h-7 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]" />
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]" />
          </div>

          <div className="text-center pt-2">
            <p className="text-gray-400 text-sm font-medium mb-2 tracking-wider">历史最高分</p>
            <p className="font-orbitron font-bold neon-text-gold" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
              {highScore.toLocaleString()}
            </p>
          </div>
        </div>

        <button
          onClick={onStart}
          className="relative gradient-btn-start btn-3d animate-pulse-glow
                     px-14 py-5 rounded-2xl font-orbitron font-black text-white
                     tracking-[0.2em] border-none cursor-pointer
                     hover:brightness-110 active:brightness-90 transition-all"
          style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)' }}
        >
          <span className="relative z-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            开始游戏
          </span>
        </button>

        <div className="text-center mt-4">
          <p className="text-gray-400 text-sm md:text-base tracking-wide">
            <span className="neon-text-cyan">方向键/AD</span> 左右移动
            <span className="mx-3 text-gray-600">|</span>
            <span className="neon-text-pink">空格键</span> 暂停
          </p>
        </div>
      </div>
    </div>
  );
}
