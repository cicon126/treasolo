import { RotateCcw, Home, Trophy } from 'lucide-react';

interface GameOverProps {
  score: number;
  highScore: number;
  isNewRecord: boolean;
  onRestart: () => void;
  onMenu: () => void;
}

export default function GameOver({ score, highScore, isNewRecord, onRestart, onMenu }: GameOverProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative glass-frosted rounded-3xl p-8 md:p-10 max-w-md w-full neon-border-pink animate-[float_2s_ease-in-out_infinite]">
        {isNewRecord && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <div className="animate-blink bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400
                            px-6 py-2 rounded-full shadow-[0_0_25px_rgba(255,215,0,0.8)]">
              <span className="font-orbitron font-black text-slate-900 tracking-widest text-sm md:text-base">
                ★ 新纪录！ ★
              </span>
            </div>
          </div>
        )}

        <div className="text-center mb-8 pt-2">
          <h2
            className="font-orbitron font-black neon-text-pink mb-2"
            style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', lineHeight: 1.1 }}
          >
            游戏结束
          </h2>
          <div className="h-[2px] w-24 mx-auto bg-gradient-to-r from-transparent via-pink-500 to-transparent" />
        </div>

        <div className="space-y-5 mb-8">
          <div className="glass-panel rounded-2xl p-5 neon-border-cyan">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-cyan-400/20 to-purple-500/20
                                flex items-center justify-center border border-cyan-400/30">
                  <Trophy className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs md:text-sm tracking-wider">本局得分</p>
                  <p className="font-orbitron font-bold neon-text-cyan" style={{ fontSize: 'clamp(1.3rem, 4vw, 2rem)' }}>
                    {score.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 neon-border-gold">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-yellow-400/20 to-orange-500/20
                                flex items-center justify-center border border-yellow-400/30">
                  <Trophy className="w-5 h-5 md:w-6 md:h-6 text-yellow-400 fill-yellow-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs md:text-sm tracking-wider">历史最高</p>
                  <p className="font-orbitron font-bold neon-text-gold" style={{ fontSize: 'clamp(1.3rem, 4vw, 2rem)' }}>
                    {highScore.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl
                       font-orbitron font-bold text-white tracking-wider
                       bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500
                       shadow-[0_0_25px_rgba(168,85,247,0.5)]
                       hover:shadow-[0_0_35px_rgba(168,85,247,0.7)]
                       hover:brightness-110 active:scale-95 transition-all cursor-pointer
                       border-none"
            style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}
          >
            <RotateCcw className="w-5 h-5" />
            再来一局
          </button>

          <button
            onClick={onMenu}
            className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl
                       font-orbitron font-bold tracking-wider
                       text-cyan-400 glass-panel
                       border-2 border-cyan-400/50
                       hover:bg-cyan-400/10 hover:border-cyan-400
                       hover:shadow-[0_0_25px_rgba(0,245,255,0.3)]
                       active:scale-95 transition-all cursor-pointer"
            style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}
          >
            <Home className="w-5 h-5" />
            返回菜单
          </button>
        </div>
      </div>
    </div>
  );
}
