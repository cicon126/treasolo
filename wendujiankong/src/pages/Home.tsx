import { TemperatureDisplay } from '../components/TemperatureDisplay';
import { StatusIndicator } from '../components/StatusIndicator';
import { ThresholdSettings } from '../components/ThresholdSettings';
import { VoiceControl } from '../components/VoiceControl';
import { AlarmControl } from '../components/AlarmControl';
import { TemperatureSimulator } from '../components/TemperatureSimulator';
import { useTemperatureMonitor } from '../hooks/useTemperatureMonitor';
import { Activity } from 'lucide-react';

export default function Home() {
  useTemperatureMonitor();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzMzQxNTUiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJWMGgydjM0em0tNCAwSDJ2LTJoMzB2MnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
      
      <div className="relative container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Activity className="w-10 h-10 text-cyan-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              温度监控模拟器
            </h1>
          </div>
          <p className="text-slate-400 text-lg">
            实时监控温度变化，智能预警提示
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          <div className="space-y-6">
            <TemperatureDisplay />
            <StatusIndicator />
          </div>

          <div className="space-y-6">
            <ThresholdSettings />
            <div className="grid grid-cols-2 gap-4">
              <VoiceControl />
              <AlarmControl />
            </div>
            <TemperatureSimulator />
          </div>
        </div>

        <footer className="text-center mt-12 text-slate-500 text-sm">
          <p>调节温度观察指示灯和语音提示变化</p>
        </footer>
      </div>
    </div>
  );
}