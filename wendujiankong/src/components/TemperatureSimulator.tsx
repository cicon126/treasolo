import { Flame, Snowflake, RefreshCw, Play, Pause } from 'lucide-react';
import { useTemperatureStore } from '../store/temperatureStore';

export const TemperatureSimulator = () => {
  const { currentTemp, autoSimulate, setCurrentTemp, toggleAutoSimulate } = useTemperatureStore();

  return (
    <div className="flex flex-col p-6 bg-slate-800/50 rounded-2xl backdrop-blur-sm border border-slate-700">
      <h3 className="text-slate-300 text-lg font-medium mb-6 text-center">温度模拟器</h3>
      
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentTemp(Math.max(0, currentTemp - 5))}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 transition-all hover:scale-105"
            title="降低5°C"
          >
            <Snowflake className="w-6 h-6" />
          </button>
          
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max="50"
              step="0.5"
              value={currentTemp}
              onChange={(e) => setCurrentTemp(Number(e.target.value))}
              className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0°C</span>
              <span>25°C</span>
              <span>50°C</span>
            </div>
          </div>
          
          <button
            onClick={() => setCurrentTemp(Math.min(50, currentTemp + 5))}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 transition-all hover:scale-105"
            title="升高5°C"
          >
            <Flame className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={toggleAutoSimulate}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
              autoSimulate
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {autoSimulate ? (
              <>
                <Pause className="w-5 h-5" />
                停止模拟
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                自动模拟
              </>
            )}
          </button>
          
          <button
            onClick={() => setCurrentTemp(25)}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all"
            title="重置温度"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center text-slate-500 text-sm mt-2">
          {autoSimulate ? '正在自动模拟温度变化...' : '拖动滑块或点击按钮调节温度'}
        </div>
      </div>
    </div>
  );
};
