interface ScoreBoardProps {
  wins: number;
  losses: number;
  draws: number;
}

const ScoreBoard = ({ wins, losses, draws }: ScoreBoardProps) => {
  const total = wins + losses + draws;
  const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : '0.0';

  return (
    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4 text-center">📊 战绩统计</h3>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="score-badge bg-green-500/80 rounded-xl p-3 text-center">
          <div className="text-3xl font-bold text-white">{wins}</div>
          <div className="text-white/80 text-sm">胜利</div>
        </div>
        <div className="score-badge bg-red-500/80 rounded-xl p-3 text-center">
          <div className="text-3xl font-bold text-white">{losses}</div>
          <div className="text-white/80 text-sm">失败</div>
        </div>
        <div className="score-badge bg-yellow-500/80 rounded-xl p-3 text-center">
          <div className="text-3xl font-bold text-white">{draws}</div>
          <div className="text-white/80 text-sm">平局</div>
        </div>
      </div>

      <div className="bg-white/10 rounded-xl p-3">
        <div className="flex justify-between items-center text-white">
          <span className="text-sm">总场次</span>
          <span className="font-bold">{total}</span>
        </div>
        <div className="flex justify-between items-center text-white mt-1">
          <span className="text-sm">胜率</span>
          <span className="font-bold text-green-300">{winRate}%</span>
        </div>
      </div>
    </div>
  );
};

export default ScoreBoard;
