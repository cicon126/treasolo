import { Difficulty, DIFFICULTY_CONFIG } from '../utils/cardGenerator';
import { getBestScore } from '../utils/formatters';

interface DifficultySelectProps {
  onSelect: (difficulty: Difficulty) => void;
}

const DIFFICULTY_STYLES: Record<Difficulty, { border: string; glow: string; icon: string; label: string }> = {
  '4x4': {
    border: 'border-neon-green hover:border-neon-green',
    glow: 'hover:shadow-[0_0_30px_rgba(0,255,136,0.4)]',
    icon: '🌱',
    label: '新手入门',
  },
  '6x6': {
    border: 'border-neon-yellow hover:border-neon-yellow',
    glow: 'hover:shadow-[0_0_30px_rgba(255,255,0,0.4)]',
    icon: '⚡',
    label: '进阶挑战',
  },
  '8x8': {
    border: 'border-neon-pink hover:border-neon-pink',
    glow: 'hover:shadow-[0_0_30px_rgba(255,0,255,0.4)]',
    icon: '🔥',
    label: '大师模式',
  },
};

export function DifficultySelect({ onSelect }: DifficultySelectProps) {
  const difficulties: Difficulty[] = ['4x4', '6x6', '8x8'];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative z-10">
      <div className="text-center mb-8 sm:mb-12 animate-float">
        <h1 className="font-pixel text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 leading-relaxed">
          <span className="neon-text-cyan">NEON</span>{' '}
          <span className="neon-text-pink">MEMORY</span>
        </h1>
        <h2 className="font-pixel text-base sm:text-xl md:text-2xl neon-text-green mb-6">
          数字记忆配对
        </h2>
        <p className="font-mono text-neon-cyan/70 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          翻转卡片，找出所有相同的数字对
          <br />
          考验你的记忆力！
        </p>
      </div>

      <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {difficulties.map((diff) => {
          const config = DIFFICULTY_CONFIG[diff];
          const style = DIFFICULTY_STYLES[diff];
          const bestScore = getBestScore(diff);

          return (
            <button
              key={diff}
              onClick={() => onSelect(diff)}
              className={`
                group relative p-6 sm:p-8 rounded-2xl
                bg-white/5 backdrop-blur-xl
                border-2 ${style.border}
                transition-all duration-300 ease-out
                hover:scale-105 hover:-translate-y-2
                ${style.glow}
                scanlines overflow-hidden
              `}
            >
              <div className="relative z-10">
                <div className="text-4xl sm:text-5xl mb-4">{style.icon}</div>
                <div className="font-pixel text-lg sm:text-xl neon-text-cyan mb-2">
                  {diff}
                </div>
                <div className="font-mono text-xs sm:text-sm text-neon-pink mb-3">
                  {style.label}
                </div>
                <div className="font-mono text-xs text-neon-cyan/60 space-y-1">
                  <div>{config.rows}行 × {config.cols}列</div>
                  <div>{config.totalPairs} 对卡片</div>
                </div>
                {bestScore > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="font-mono text-xs text-neon-yellow/80">
                      🏆 最高分
                    </div>
                    <div className="font-pixel text-sm neon-text-yellow mt-1">
                      {bestScore}
                    </div>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          );
        })}
      </div>

      <div className="mt-12 sm:mt-16 font-mono text-xs sm:text-sm text-neon-cyan/40 text-center max-w-lg">
        <p>💡 小提示：点击两张卡片进行配对</p>
        <p className="mt-1">匹配成功加分，失败扣分，越快完成分数越高</p>
      </div>
    </div>
  );
}
