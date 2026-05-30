import React from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import useShapeStore from '@/store/useShapeStore';

export default function PropertyPanel() {
  const size = useShapeStore((s) => s.size);
  const opacity = useShapeStore((s) => s.opacity);
  const rotation = useShapeStore((s) => s.rotation);
  const strokeWidth = useShapeStore((s) => s.strokeWidth);
  const setSize = useShapeStore((s) => s.setSize);
  const setOpacity = useShapeStore((s) => s.setOpacity);
  const setRotation = useShapeStore((s) => s.setRotation);
  const setStrokeWidth = useShapeStore((s) => s.setStrokeWidth);
  const undo = useShapeStore((s) => s.undo);
  const clearCanvas = useShapeStore((s) => s.clearCanvas);

  return (
    <div className="bg-white/5 rounded-xl p-4 space-y-4">
      <div>
        <div className="flex justify-between">
          <span className="text-xs text-zinc-400">大小</span>
          <span className="text-xs text-zinc-300">{size}</span>
        </div>
        <input
          type="range"
          className="neon-slider w-full"
          min={40}
          max={300}
          step={5}
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
        />
      </div>

      <div>
        <div className="flex justify-between">
          <span className="text-xs text-zinc-400">透明度</span>
          <span className="text-xs text-zinc-300">{Math.round(opacity * 100)}%</span>
        </div>
        <input
          type="range"
          className="neon-slider w-full"
          min={0}
          max={1}
          step={0.05}
          value={opacity}
          onChange={(e) => setOpacity(Number(e.target.value))}
        />
      </div>

      <div>
        <div className="flex justify-between">
          <span className="text-xs text-zinc-400">旋转</span>
          <span className="text-xs text-zinc-300">{rotation}°</span>
        </div>
        <input
          type="range"
          className="neon-slider w-full"
          min={0}
          max={360}
          step={5}
          value={rotation}
          onChange={(e) => setRotation(Number(e.target.value))}
        />
      </div>

      <div>
        <div className="flex justify-between">
          <span className="text-xs text-zinc-400">边框宽度</span>
          <span className="text-xs text-zinc-300">{strokeWidth}</span>
        </div>
        <input
          type="range"
          className="neon-slider w-full"
          min={0}
          max={20}
          step={1}
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
        />
      </div>

      <div className="flex gap-2">
        <button
          className="flex-1 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 flex items-center justify-center gap-2 text-sm transition-colors"
          onClick={undo}
        >
          <RotateCcw size={16} />
          撤销
        </button>
        <button
          className="flex-1 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 flex items-center justify-center gap-2 text-sm transition-colors"
          onClick={clearCanvas}
        >
          <Trash2 size={16} />
          清除
        </button>
      </div>
    </div>
  );
}
