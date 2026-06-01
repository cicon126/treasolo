import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Calendar, Clock, User, Trash2, Filter, Users, MapPin } from 'lucide-react';
import { useBookingStore } from '../store/useBookingStore.js';
import { useRoomStore } from '../store/useRoomStore.js';
import { formatDisplayDate, getToday } from '../utils/dateUtils.js';

export default function BookingList() {
  const { bookings, fetchBookings, deleteBooking, loading } = useBookingStore();
  const { rooms, fetchRooms } = useRoomStore();
  const [filterDate, setFilterDate] = useState('');
  const [filterRoom, setFilterRoom] = useState<number | ''>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchBookings();
    fetchRooms();
  }, [fetchBookings, fetchRooms]);

  const filteredBookings = bookings.filter(booking => {
    let match = true;
    if (filterDate) {
      match = match && booking.date === filterDate;
    }
    if (filterRoom !== '') {
      match = match && booking.roomId === filterRoom;
    }
    return match;
  }).sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  const handleDelete = async (id: number) => {
    try {
      await deleteBooking(id);
      toast.success('预约已取消');
      setShowDeleteConfirm(null);
    } catch (error) {
      toast.error('取消失败', {
        description: error instanceof Error ? error.message : '请稍后重试'
      });
    }
  };

  const clearFilters = () => {
    setFilterDate('');
    setFilterRoom('');
  };

  const isPastBooking = (date: string) => {
    return date < getToday();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">预约列表</h2>
            <p className="text-slate-600">查看和管理所有会议室预约</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 p-2 bg-white rounded-xl shadow-md">
              <Filter className="w-5 h-5 text-slate-400" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-transparent border-none outline-none text-slate-700"
              />
            </div>
            
            <select
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value ? parseInt(e.target.value) : '')}
              className="px-4 py-2 bg-white rounded-xl shadow-md border-none outline-none text-slate-700"
            >
              <option value="">全部会议室</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
            
            {(filterDate || filterRoom !== '') && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-white/50 rounded-xl transition-colors"
              >
                清除筛选
              </button>
            )}
          </div>
        </div>

        {loading && filteredBookings.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">暂无预约记录</h3>
            <p className="text-slate-600 mb-4">
              {filterDate || filterRoom !== '' ? '当前筛选条件下没有预约记录' : '还没有任何会议室预约'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map(booking => {
              const past = isPastBooking(booking.date);
              return (
                <div
                  key={booking.id}
                  className={`bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl ${
                    past ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-slate-800">{booking.meetingName}</h3>
                        {past && (
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                            已结束
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <span>{booking.roomName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="w-4 h-4 text-emerald-500" />
                          <span>{formatDisplayDate(booking.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="w-4 h-4 text-purple-500" />
                          <span>{booking.startTime} - {booking.endTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <User className="w-4 h-4 text-orange-500" />
                          <span>{booking.organizer}</span>
                        </div>
                      </div>
                      
                      {booking.attendees && booking.attendees > 1 && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                          <Users className="w-4 h-4" />
                          <span>{booking.attendees} 人参会</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {showDeleteConfirm === booking.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600">确认取消？</span>
                          <button
                            onClick={() => handleDelete(booking.id)}
                            className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm font-medium"
                          >
                            确认
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium"
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        !past && (
                          <button
                            onClick={() => setShowDeleteConfirm(booking.id)}
                            className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                            title="取消预约"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="mt-8 text-center text-sm text-slate-500">
          共 {filteredBookings.length} 条预约记录
        </div>
      </div>
    </div>
  );
}
