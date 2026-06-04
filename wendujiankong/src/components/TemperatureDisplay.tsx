import { Thermometer } from 'lucide-react';
import { useTemperatureStore } from '../store/temperatureStore';

export const TemperatureDisplay = () => {
  const { currentTemp, status } = useTemperatureStore();

  const getStatusColor = () => {
    switch (status) {
      case 'too-high':
        return 'text-red-500';
      case 'too-low':
        return 'text-blue-400';
      default:
        return 'text-green-400';
    }
  };

  const getGlowColor = () => {
    switch (status) {
      case 'too-high':
        return 'shadow-red-500/50';
      case 'too-low':
        return 'shadow-blue-400/50';
      default:
        return 'shadow-green-400/50';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-800/50 rounded-2xl backdrop-blur-sm border border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        <Thermometer className={`w-8 h-8 ${getStatusColor()}`} />
        <span className="text-slate-300 text-lg font-medium">当前温度</span>
      </div>
      <div
        className={`relative flex items-center justify-center w-48 h-48 rounded-full bg-slate-900 border-4 ${
          status === 'normal' ? 'border-green-500' : 'border-red-500'
        } shadow-lg ${getGlowColor()} transition-all duration-500`}
      >
        <span className={`text-6xl font-mono font-bold ${getStatusColor()} transition-colors duration-300`}>
          {currentTemp.toFixed(1)}
        </span>
        <span className="absolute top-12 right-10 text-2xl font-mono text-slate-400">°C</span>
      </div>
    </div>
  );
};
