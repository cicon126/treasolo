import { useGameStore } from "@/store/gameStore";
import { RotateCcw, Trash2 } from "lucide-react";

export default function ScoreBoard() {
  const { playerScore, aiScore, drawCount, winner, gameOver, currentPlayer, isThinking, playerPiece, playerFirst, resetGame, resetScores, setPlayerFirst } = useGameStore();

  const getStatusText = () => {
    if (gameOver) {
      if (winner === playerPiece) return "🎉 你赢了！";
      if (winner !== 0) return "🤖 AI 赢了！";
      return "🤝 平局！";
    }
    if (isThinking) return "AI 思考中...";
    return currentPlayer === playerPiece ? (playerPiece === 1 ? "⚫ 轮到你下棋" : "⚪ 轮到你下棋") : (currentPlayer === 1 ? "⚫ AI 回合" : "⚪ AI 回合");
  };

  const playerStoneColor = playerPiece === 1
    ? "bg-gradient-to-br from-gray-600 to-gray-900"
    : "bg-gradient-to-br from-white to-gray-200 border border-gray-300";
  const aiStoneColor = playerPiece === 1
    ? "bg-gradient-to-br from-white to-gray-200 border border-gray-300"
    : "bg-gradient-to-br from-gray-600 to-gray-900";

  return (
    <div className="w-full max-w-[540px] mx-auto">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full shadow-md ${playerStoneColor}`} />
            <span className="font-semibold text-gray-800">你</span>
            <span className="text-xs text-gray-400">({playerPiece === 1 ? "黑" : "白"})</span>
          </div>
          <div className="text-center">
            <span className="text-3xl font-bold text-gray-800">
              {playerScore} <span className="text-lg text-gray-400 mx-1">:</span> {aiScore}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">({playerPiece === 1 ? "白" : "黑"})</span>
            <span className="font-semibold text-gray-800">AI</span>
            <div className={`w-6 h-6 rounded-full shadow-md ${aiStoneColor}`} />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">平局: {drawCount}</span>
          <span className={`font-medium ${gameOver ? (winner === playerPiece ? "text-green-600" : winner !== 0 ? "text-red-500" : "text-amber-500") : "text-gray-600"}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-3 mb-4">
        <div className="flex items-center justify-center gap-3">
          <span className={`text-sm font-medium ${playerFirst ? "text-amber-600" : "text-gray-400"}`}>我先手 (黑)</span>
          <button
            onClick={() => setPlayerFirst(!playerFirst)}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${playerFirst ? "bg-amber-400" : "bg-indigo-400"}`}
          >
            <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${playerFirst ? "left-0.5" : "left-[30px]"}`} />
          </button>
          <span className={`text-sm font-medium ${!playerFirst ? "text-indigo-600" : "text-gray-400"}`}>AI 先手 (黑)</span>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={resetGame}
          className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-2.5 px-4 rounded-xl font-medium transition-colors shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          <RotateCcw size={16} />
          重新开始
        </button>
        <button
          onClick={resetScores}
          className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 px-4 rounded-xl font-medium transition-colors"
        >
          <Trash2 size={16} />
          清除比分
        </button>
      </div>
    </div>
  );
}
