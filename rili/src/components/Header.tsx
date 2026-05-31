import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface HeaderProps {
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

const MONTH_NAMES = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

export default function Header({ year, month, onPrevMonth, onNextMonth, onToday }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-800 text-white py-6 px-8 shadow-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
            <Calendar className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wide">万年历</h1>
            <p className="text-sm text-white/60">查看公历 · 农历 · 节假日</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={onPrevMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-105"
            aria-label="上一月"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="text-center min-w-[160px]">
            <div className="text-3xl font-bold text-amber-400">
              {year}年
            </div>
            <div className="text-xl font-medium">
              {MONTH_NAMES[month]}
            </div>
          </div>
          
          <button
            onClick={onNextMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-105"
            aria-label="下一月"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        
        <button
          onClick={onToday}
          className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold rounded-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-amber-500/30"
        >
          今天
        </button>
      </div>
    </header>
  );
}
