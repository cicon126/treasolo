import { Bell, BellOff } from 'lucide-react';
import { useTemperatureStore } from '../store/temperatureStore';

export const AlarmControl = () => {
  const { alarmEnabled, toggleAlarm } = useTemperatureStore();

  return (
    <div className="flex items-center justify-between p-6 bg-slate-800/50 rounded-2xl backdrop-blur-sm border border-slate-700">
      <div className="flex items-center gap-3">
        {alarmEnabled ? (
          <Bell className="w-6 h-6 text-orange-400" />
        ) : (
          <BellOff className="w-6 h-6 text-slate-500" />
        )}
        <span className="text-slate-300 font-medium">警报声</span>
      </div>
      <button
        onClick={toggleAlarm}
        className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
          alarmEnabled ? 'bg-orange-500' : 'bg-slate-600'
        }`}
      >
        <div
          className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${
            alarmEnabled ? 'translate-x-8' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};
