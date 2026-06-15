import { useGameLogic } from './hooks/useGameLogic';
import { DifficultySelect } from './components/DifficultySelect';
import { StatusBar } from './components/StatusBar';
import { GameBoard } from './components/GameBoard';
import { ActionButtons } from './components/ActionButtons';
import { VictoryModal } from './components/VictoryModal';

export default function App() {
  const game = useGameLogic();

  if (game.gameStatus === 'selecting') {
    return <DifficultySelect onSelect={game.startGame} />;
  }

  return (
    <div className="min-h-screen py-4 sm:py-8 px-2 sm:px-4">
      <div className="relative z-10">
        <header className="w-full max-w-4xl mx-auto mb-4 sm:mb-6 text-center">
          <h1 className="font-pixel text-base sm:text-xl md:text-2xl leading-relaxed">
            <span className="neon-text-cyan">NEON</span>{' '}
            <span className="neon-text-pink">MEMORY</span>{' '}
            <span className="neon-text-green">MATCH</span>
          </h1>
        </header>

        <StatusBar
          difficulty={game.difficulty}
          moves={game.moves}
          matches={game.matches}
          totalPairs={game.totalPairs}
          score={game.score}
          elapsedTime={game.elapsedTime}
        />

        <GameBoard
          cards={game.cards}
          difficulty={game.difficulty}
          mismatchedCards={game.mismatchedCards}
          onCardClick={game.handleCardClick}
        />

        <ActionButtons
          onReset={game.resetGame}
          onHome={game.goToMenu}
          onHint={game.showHint}
        />

        <footer className="mt-8 sm:mt-12 text-center">
          <p className="font-mono text-[10px] sm:text-xs text-neon-cyan/30">
            点击卡片翻转 · 找出所有配对 · 争取更高分数
          </p>
        </footer>
      </div>

      {game.gameStatus === 'victory' && (
        <VictoryModal
          difficulty={game.difficulty}
          moves={game.moves}
          matches={game.matches}
          totalPairs={game.totalPairs}
          score={game.score}
          elapsedTime={game.elapsedTime}
          onRestart={game.resetGame}
          onHome={game.goToMenu}
          onNextLevel={game.nextLevel}
          hasNextLevel={game.hasNextLevel}
        />
      )}
    </div>
  );
}
