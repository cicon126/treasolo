import { useTemperatureStore } from '../store/temperatureStore';

export const StatusIndicator = () => {
  const { status } = useTemperatureStore();

  const getStatusText = () => {
    switch (status) {
      case 'too-high':
        return '温度过高，请降温';
      case 'too-low':
        return '温度过低，请升温';
      default:
        return '温度正常';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-800/50 rounded-2xl backdrop-blur-sm border border-slate-700">
      <span className="text-slate-300 text-lg font-medium mb-6">状态指示灯</span>
      <div className="relative">
        <div
          className={`w-24 h-24 rounded-full transition-all duration-300 ${
            status === 'normal'
              ? 'bg-green-500 shadow-[0_0_30px_rgba(34,197,94,0.8)]'
              : 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.8)] animate-blink'
          }`}
        />
        <div
          className={`absolute inset-0 w-24 h-24 rounded-full blur-xl opacity-60 ${
            status === 'normal' ? 'bg-green-400' : 'bg-red-400'
          } ${status !== 'normal' ? 'animate-pulse' : ''}`}
        />
      </div>
      <div
        className={`mt-6 px-4 py-2 rounded-lg font-medium text-center ${
          status === 'normal'
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
        }`}
      >
        {getStatusText()}
      </div>
    </div>
  );
};
