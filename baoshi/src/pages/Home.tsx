import { useGameLogic } from '@/hooks/useGameLogic';
import { useWindowSize } from '@/hooks/useWindowSize';
import GameBoard from '@/components/GameBoard';
import ScorePanel from '@/components/ScorePanel';
import GameControls from '@/components/GameControls';
import { Sparkles } from 'lucide-react';
import { BOARD_SIZE } from '@/types/game';

export default function Home() {
  const {
    board,
    score,
    selectedGem,
    isAnimating,
    matchedCount,
    combo,
    handleGemClick,
    resetGame,
  } = useGameLogic();

  const { width, height } = useWindowSize();
  
  const maxBoardSize = Math.min(width - 400, height - 200);
  const cellSize = Math.max(40, Math.floor(maxBoardSize / BOARD_SIZE));

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8"
      style={{
        background: 'linear-gradient(135deg, #0c0c1e 0%, #1a1a3e 50%, #16213e 100%)',
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: Math.random() * 6 + 2,
              height: Math.random() * 6 + 2,
              background: `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="text-center mb-6">
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2 flex items-center justify-center gap-3"
            style={{
              background: 'linear-gradient(135deg, #ffe66d, #ff6b6b, #a29bfe, #4ecdc4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400" />
            宝石迷阵
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400" />
          </h1>
          <p className="text-white/50 text-sm sm:text-base lg:text-lg">
            {isAnimating ? '消除中...' : '交换相邻宝石，三连消除得分！'}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-center lg:items-start">
          <div className="w-full lg:w-auto min-w-[160px] max-w-[200px]">
            <ScorePanel
              score={score}
              matchedCount={matchedCount}
              combo={combo}
            />
          </div>

          <GameBoard
            board={board}
            selectedGem={selectedGem}
            onGemClick={handleGemClick}
            cellSize={cellSize}
          />

          <div className="w-full lg:w-auto min-w-[160px] max-w-[200px]">
            <GameControls onReset={resetGame} />
          </div>
        </div>
      </div>
    </div>
  );
}
