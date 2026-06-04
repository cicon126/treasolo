import { Minus, Plus } from 'lucide-react';
import { useTemperatureStore } from '../store/temperatureStore';

export const ThresholdSettings = () => {
  const { minTemp, maxTemp, setMinTemp, setMaxTemp } = useTemperatureStore();

  return (
    <div className="flex flex-col p-6 bg-slate-800/50 rounded-2xl backdrop-blur-sm border border-slate-700">
      <h3 className="text-slate-300 text-lg font-medium mb-6 text-center">温度阈值设置</h3>
      
      <div className="space-y-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">下限温度</span>
            <span className="text-blue-400 font-mono font-bold text-xl">{minTemp}°C</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMinTemp(Math.max(0, minTemp - 1))}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>
            <input
              type="range"
              min="0"
              max="50"
              value={minTemp}
              onChange={(e) => setMinTemp(Number(e.target.value))}
              className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <button
              onClick={() => setMinTemp(Math.min(50, minTemp + 1))}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">上限温度</span>
            <span className="text-red-400 font-mono font-bold text-xl">{maxTemp}°C</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMaxTemp(Math.max(0, maxTemp - 1))}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>
            <input
              type="range"
              min="0"
              max="50"
              value={maxTemp}
              onChange={(e) => setMaxTemp(Number(e.target.value))}
              className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <button
              onClick={() => setMaxTemp(Math.min(50, maxTemp + 1))}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
