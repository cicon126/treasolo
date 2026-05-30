import ScoreBoard from "@/components/ScoreBoard";
import GameBoard from "@/components/GameBoard";
import { useGameStore } from "@/store/gameStore";

export default function Home() {
  const { gameOver, winner, playerPiece, resetGame } = useGameStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col items-center py-6 px-4">
      <h1 className="text-2xl font-bold text-amber-800 mb-4 tracking-wide">♟ 五子棋</h1>

      <ScoreBoard />

      <GameBoard />

      {gameOver && (
        <div className="mt-6 animate-bounce">
          <button
            onClick={resetGame}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            {winner === playerPiece ? "🎉 再来一局" : winner !== 0 ? "💪 不服再战" : "🤝 再来一局"}
          </button>
        </div>
      )}

      <p className="mt-6 text-xs text-amber-700/50">点击棋盘交叉点落子 · 黑棋先手</p>
    </div>
  );
}
