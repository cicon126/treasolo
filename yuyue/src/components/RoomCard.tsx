import { Users, MapPin, Monitor, Video, Mic, PenTool, Tv, Speaker } from 'lucide-react';
import { Room } from '../../shared/types.js';

interface RoomCardProps {
  room: Room;
  selected: boolean;
  onClick: () => void;
}

const equipmentIcons: Record<string, typeof Monitor> = {
  '投影仪': Monitor,
  '白板': PenTool,
  '视频会议系统': Video,
  '音响系统': Speaker,
  '电视屏幕': Tv,
  '专业音响': Speaker,
  '录音设备': Mic
};

export default function RoomCard({ room, selected, onClick }: RoomCardProps) {
  const gradientColors = [
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-purple-500 to-violet-600',
    'from-orange-500 to-amber-600'
  ];

  const colorIndex = room.id % gradientColors.length;
  const gradient = gradientColors[colorIndex];

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 transform ${
        selected
          ? 'scale-105 shadow-2xl ring-4 ring-blue-400 ring-offset-2'
          : 'hover:scale-102 hover:shadow-xl'
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`} />
      
      <div className="relative p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold">{room.name}</h3>
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-white/90">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{room.location}</span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <Users className="w-4 h-4" />
            <span className="text-sm">容纳 {room.capacity} 人</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {room.equipment.slice(0, 4).map((eq) => {
            const Icon = equipmentIcons[eq] || Monitor;
            return (
              <div
                key={eq}
                className="flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs"
                title={eq}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{eq}</span>
              </div>
            );
          })}
          {room.equipment.length > 4 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs">
              +{room.equipment.length - 4}
            </div>
          )}
        </div>
        
        {room.description && (
          <p className="text-sm text-white/80 line-clamp-2">{room.description}</p>
        )}
        
        {selected && (
          <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
