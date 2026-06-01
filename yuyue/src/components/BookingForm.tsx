import { useState } from 'react';
import { Calendar as CalendarIcon, Users, User, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { formatDisplayDate } from '../utils/dateUtils.js';
import { Room } from '../../shared/types.js';

interface BookingFormProps {
  room: Room | null;
  date: string;
  timeSlot: { start: string; end: string } | null;
  onSubmit: (data: { meetingName: string; organizer: string; attendees: number }) => void;
  loading: boolean;
}

export default function BookingForm({ room, date, timeSlot, onSubmit, loading }: BookingFormProps) {
  const [meetingName, setMeetingName] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [attendees, setAttendees] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!meetingName.trim()) {
      newErrors.meetingName = '请输入会议名称';
    }
    
    if (!organizer.trim()) {
      newErrors.organizer = '请输入组织者姓名';
    }
    
    if (attendees < 1) {
      newErrors.attendees = '参会人数至少为1人';
    }
    
    if (room && attendees > room.capacity) {
      newErrors.attendees = `参会人数不能超过会议室容量（${room.capacity}人）`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!room || !timeSlot) return;
    
    if (validate()) {
      onSubmit({
        meetingName: meetingName.trim(),
        organizer: organizer.trim(),
        attendees
      });
      setMeetingName('');
      setOrganizer('');
      setAttendees(1);
    }
  };

  const isFormValid = room && date && timeSlot && meetingName.trim() && organizer.trim();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-6">预约信息</h3>
      
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">会议室</p>
            <p className="font-medium text-slate-800">
              {room ? room.name : <span className="text-slate-400">请选择会议室</span>}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">预约日期</p>
            <p className="font-medium text-slate-800">{formatDisplayDate(date)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">预约时段</p>
            <p className="font-medium text-slate-800">
              {timeSlot
                ? `${timeSlot.start} - ${timeSlot.end}`
                : <span className="text-slate-400">请选择时间段</span>
              }
            </p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            会议名称
          </label>
          <input
            type="text"
            value={meetingName}
            onChange={(e) => setMeetingName(e.target.value)}
            placeholder="请输入会议名称"
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300
              ${errors.meetingName
                ? 'border-rose-400 bg-rose-50 focus:border-rose-500'
                : 'border-slate-200 focus:border-blue-500 focus:bg-blue-50/50'
              }
              focus:outline-none
            `}
          />
          {errors.meetingName && (
            <p className="mt-1 text-sm text-rose-500">{errors.meetingName}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            组织者
          </label>
          <input
            type="text"
            value={organizer}
            onChange={(e) => setOrganizer(e.target.value)}
            placeholder="请输入您的姓名"
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300
              ${errors.organizer
                ? 'border-rose-400 bg-rose-50 focus:border-rose-500'
                : 'border-slate-200 focus:border-blue-500 focus:bg-blue-50/50'
              }
              focus:outline-none
            `}
          />
          {errors.organizer && (
            <p className="mt-1 text-sm text-rose-500">{errors.organizer}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Users className="w-4 h-4 inline mr-2" />
            参会人数
            {room && <span className="text-slate-400 ml-2">（最多 {room.capacity} 人）</span>}
          </label>
          <input
            type="number"
            value={attendees}
            onChange={(e) => setAttendees(parseInt(e.target.value) || 1)}
            min={1}
            max={room?.capacity || 100}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300
              ${errors.attendees
                ? 'border-rose-400 bg-rose-50 focus:border-rose-500'
                : 'border-slate-200 focus:border-blue-500 focus:bg-blue-50/50'
              }
              focus:outline-none
            `}
          />
          {errors.attendees && (
            <p className="mt-1 text-sm text-rose-500">{errors.attendees}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={!isFormValid || loading}
          className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300
            flex items-center justify-center gap-2
            ${isFormValid && !loading
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              : 'bg-slate-300 cursor-not-allowed'
            }
          `}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              提交中...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              确认预约
            </>
          )}
        </button>
      </form>
    </div>
  );
}
