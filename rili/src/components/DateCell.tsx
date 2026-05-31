import { DateInfo } from '../types';

interface DateCellProps {
  dateInfo: DateInfo;
  isSelected: boolean;
  onClick: () => void;
}

export default function DateCell({ dateInfo, isSelected, onClick }: DateCellProps) {
  const { day, weekDay, isToday, isCurrentMonth, lunar, festival, hasEvents } = dateInfo;
  
  const displayText = festival || (lunar.day === 1 ? lunar.monthName : lunar.dayName);
  
  return (
    <button
      onClick={onClick}
      className={`
        relative h-24 p-2 flex flex-col items-center justify-start
        transition-all duration-200 rounded-xl
        ${!isCurrentMonth ? 'opacity-30' : ''}
        ${isToday ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg' : ''}
        ${isSelected && !isToday ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg scale-105' : ''}
        ${!isSelected && !isToday && isCurrentMonth ? 'bg-white/5 hover:bg-white/10 text-white hover:scale-102' : ''}
        ${!isSelected && !isToday && !isCurrentMonth ? 'bg-transparent text-white/50' : ''}
        ${weekDay === 0 || weekDay === 6 ? (isToday || isSelected ? '' : 'text-rose-300') : ''}
      `}
    >
      <span className={`
        text-lg font-bold
        ${isToday ? 'text-white' : ''}
        ${isSelected && !isToday ? 'text-white' : ''}
      `}>
        {day}
      </span>
      
      <span className={`
        text-xs mt-1 truncate max-w-full
        ${festival ? 'text-amber-300 font-semibold' : 'text-white/60'}
        ${isToday || isSelected ? 'text-white/90' : ''}
      `}>
        {displayText}
      </span>
      
      {hasEvents && (
        <div className="absolute bottom-2 flex gap-1">
          <span className={`
            w-1.5 h-1.5 rounded-full animate-pulse
            ${isToday || isSelected ? 'bg-white' : 'bg-amber-400'}
          `} />
        </div>
      )}
    </button>
  );
}
