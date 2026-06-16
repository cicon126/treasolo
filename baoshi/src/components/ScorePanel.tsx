import { Sparkles, Trophy, Gem } from 'lucide-react';

interface ScorePanelProps {
  score: number;
  matchedCount: number;
  combo: number;
}

export default function ScorePanel({ score, matchedCount, combo }: ScorePanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <div
        className="rounded-2xl p-6 text-center"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <span className="text-white/70 text-sm font-medium">得分</span>
        </div>
        <div
          className="text-5xl font-bold bg-clip-text text-transparent"
          style={{
            backgroundImage: 'linear-gradient(135deg, #ffe66d, #ff6b6b, #a29bfe)',
          }}
        >
          {score.toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-xl p-4 text-center"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex items-center justify-center gap-1 mb-1">
            <Gem className="w-4 h-4 text-cyan-400" />
            <span className="text-white/60 text-xs">消除</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {matchedCount}
          </div>
        </div>

        <div
          className="rounded-xl p-4 text-center"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex items-center justify-center gap-1 mb-1">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-white/60 text-xs">连击</span>
          </div>
          <div className={`text-2xl font-bold ${combo > 0 ? 'text-yellow-400 animate-bounce' : 'text-white'}`}>
            {combo}x
          </div>
        </div>
      </div>
    </div>
  );
}
