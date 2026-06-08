import MainMenu from './components/MainMenu';
import GameCanvas from './components/GameCanvas';
import StatusPanel from './components/StatusPanel';
import ResultModal from './components/ResultModal';
import { useGameEngine } from './hooks/useGameEngine';

export default function App() {
  const { state, startGame, togglePause, setDirection, goToMenu, nextLevel, retry } = useGameEngine();
  const { isPlaying, isPaused, isGameOver, isVictory } = state;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-sky-50 to-orange-50">
      {!isPlaying && !isGameOver && !isVictory ? (
        <MainMenu
          highScore={state.highScore}
          unlockedLevels={state.unlockedLevels}
          onStart={(lv) => startGame(lv)}
        />
      ) : (
        <div className="min-h-screen w-full flex flex-col lg:flex-row items-center justify-center gap-6 p-4 lg:p-8">
          <div className="flex flex-col items-center gap-4 w-full lg:w-auto animate-fadeIn">
            <GameCanvas
              snake={state.snake}
              food={state.food}
              direction={state.direction}
              levelConfig={state.currentLevelConfig}
              onSwipe={setDirection}
            />
            <div className="lg:hidden flex gap-2">
              <div className="grid grid-cols-3 gap-2">
                <div />
                <button
                  onClick={() => setDirection('UP')}
                  className="w-14 h-14 rounded-2xl bg-white shadow-md active:scale-95 flex items-center justify-center text-2xl"
                >
                  ⬆️
                </button>
                <div />
                <button
                  onClick={() => setDirection('LEFT')}
                  className="w-14 h-14 rounded-2xl bg-white shadow-md active:scale-95 flex items-center justify-center text-2xl"
                >
                  ⬅️
                </button>
                <button
                  onClick={togglePause}
                  className="w-14 h-14 rounded-2xl bg-orange-100 shadow-md active:scale-95 flex items-center justify-center text-xl"
                >
                  {isPaused ? '▶️' : '⏸️'}
                </button>
                <button
                  onClick={() => setDirection('RIGHT')}
                  className="w-14 h-14 rounded-2xl bg-white shadow-md active:scale-95 flex items-center justify-center text-2xl"
                >
                  ➡️
                </button>
                <div />
                <button
                  onClick={() => setDirection('DOWN')}
                  className="w-14 h-14 rounded-2xl bg-white shadow-md active:scale-95 flex items-center justify-center text-2xl"
                >
                  ⬇️
                </button>
                <div />
              </div>
            </div>
          </div>

          <div className="w-full max-w-sm lg:max-w-xs">
            <StatusPanel
              score={state.score}
              targetScore={state.targetScore}
              level={state.level}
              lives={state.lives}
              highScore={state.highScore}
              isPaused={state.isPaused}
              onTogglePause={togglePause}
              onRetry={retry}
              onHome={goToMenu}
            />
          </div>
        </div>
      )}

      <ResultModal
        isVictory={state.isVictory}
        isGameOver={state.isGameOver}
        score={state.score}
        level={state.level}
        highScore={state.highScore}
        onRetry={retry}
        onNextLevel={nextLevel}
        onHome={goToMenu}
      />

      {isPlaying && isPaused && !isGameOver && !isVictory && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl px-10 py-8 shadow-2xl text-center">
            <p className="text-5xl mb-3">⏸️</p>
            <p className="text-2xl font-bold text-slate-700">游戏暂停</p>
            <p className="text-slate-500 mt-1">按空格键继续</p>
          </div>
        </div>
      )}
    </div>
  );
}
