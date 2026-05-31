import { Plus, Edit2, Trash2, Clock, CalendarDays } from 'lucide-react';
import { CalendarEvent } from '../types';
import { solarToLunar, getWeekDayName } from '../utils/lunar';
import { getHoliday } from '../utils/holiday';

interface EventPanelProps {
  selectedDate: Date | null;
  events: CalendarEvent[];
  onAddEvent: () => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
}

export default function EventPanel({ selectedDate, events, onAddEvent, onEditEvent, onDeleteEvent }: EventPanelProps) {
  if (!selectedDate) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10 h-full flex flex-col items-center justify-center">
        <CalendarDays className="w-16 h-16 text-white/30 mb-4" />
        <p className="text-white/50 text-center">
          请选择一个日期<br />查看详情和事项
        </p>
      </div>
    );
  }

  const lunar = solarToLunar(selectedDate);
  const weekDay = selectedDate.getDay();
  const festival = getHoliday(
    selectedDate.getMonth() + 1,
    selectedDate.getDate(),
    lunar.month,
    lunar.day
  );

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 h-full flex flex-col overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-4xl font-bold text-white">
              {selectedDate.getDate()}
            </div>
            <div className="text-lg text-white/70 mt-1">
              {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月
            </div>
            <div className="text-amber-400 font-medium mt-1">
              {getWeekDayName(weekDay)}
            </div>
          </div>
          <button
            onClick={onAddEvent}
            className="p-3 bg-amber-500 hover:bg-amber-400 text-gray-900 rounded-xl transition-all hover:scale-105 shadow-lg"
            title="添加事项"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
        
        <div className="mt-4 space-y-1">
          <div className="text-sm text-white/60">
            农历 {lunar.yearGanZhi}年 [{lunar.yearShengXiao}年]
          </div>
          <div className="text-sm text-white/60">
            {lunar.monthName}{lunar.dayName}
          </div>
          {festival && (
            <div className="text-sm text-rose-400 font-semibold mt-2">
              🎉 {festival}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        <h3 className="text-white/70 text-sm font-semibold mb-4">
          事项列表 ({events.length})
        </h3>
        
        {events.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/30 text-sm">暂无事项</p>
            <p className="text-white/20 text-xs mt-1">点击右上角 + 添加</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="group bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all border border-transparent hover:border-white/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">
                      {event.title}
                    </div>
                    {event.time && (
                      <div className="flex items-center gap-1 text-white/50 text-sm mt-1">
                        <Clock className="w-3 h-3" />
                        {event.time}
                      </div>
                    )}
                    {event.description && (
                      <div className="text-white/40 text-sm mt-2 line-clamp-2">
                        {event.description}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditEvent(event)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Edit2 className="w-4 h-4 text-white/60 hover:text-white" />
                    </button>
                    <button
                      onClick={() => onDeleteEvent(event.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
