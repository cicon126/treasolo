import { RotateCcw, Info } from 'lucide-react';

interface GameControlsProps {
  onReset: () => void;
}

export default function GameControls({ onReset }: GameControlsProps) {
  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={onReset}
        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
        }}
      >
        <RotateCcw className="w-5 h-5" />
        重新开始
      </button>

      <div
        className="rounded-xl p-4"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-blue-400" />
          <span className="text-white font-medium">游戏说明</span>
        </div>
        <ul className="text-white/70 text-sm space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-cyan-400">•</span>
            <span>点击选择一颗宝石</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400">•</span>
            <span>点击相邻宝石进行交换</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400">•</span>
            <span>三个或更多相同颜色宝石连成一线即可消除</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400">•</span>
            <span>连续消除可获得连击加分</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
