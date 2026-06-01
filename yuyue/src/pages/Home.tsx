import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import RoomCard from '../components/RoomCard.js';
import Calendar from '../components/Calendar.js';
import TimeSlot from '../components/TimeSlot.js';
import BookingForm from '../components/BookingForm.js';
import { useRoomStore } from '../store/useRoomStore.js';
import { useBookingStore } from '../store/useBookingStore.js';
import { getToday } from '../utils/dateUtils.js';
import { Booking } from '../../shared/types.js';

export default function Home() {
  const { rooms, selectedRoom, selectRoom, fetchRooms, loading: roomsLoading } = useRoomStore();
  const {
    selectedDate,
    selectedTimeSlot,
    setSelectedDate,
    setSelectedTimeSlot,
    createBooking,
    fetchBookingsByRoomAndDate,
    loading: bookingLoading
  } = useBookingStore();

  const [dayBookings, setDayBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    if (selectedRoom && selectedDate) {
      fetchBookingsByRoomAndDate(selectedRoom.id, selectedDate)
        .then(bookings => setDayBookings(bookings))
        .catch(() => setDayBookings([]));
    } else {
      setDayBookings([]);
    }
  }, [selectedRoom, selectedDate, fetchBookingsByRoomAndDate]);

  useEffect(() => {
    useBookingStore.getState().fetchBookings()
      .then(() => setAllBookings(useBookingStore.getState().bookings));
  }, []);

  const handleRoomSelect = (room: typeof rooms[0]) => {
    selectRoom(room);
    setSelectedTimeSlot(null);
  };

  const handleSubmit = async (data: { meetingName: string; organizer: string; attendees: number }) => {
    if (!selectedRoom || !selectedTimeSlot) return;

    try {
      await createBooking({
        roomId: selectedRoom.id,
        meetingName: data.meetingName,
        date: selectedDate,
        startTime: selectedTimeSlot.start,
        endTime: selectedTimeSlot.end,
        organizer: data.organizer,
        attendees: data.attendees
      });

      toast.success('预约成功！', {
        description: `${selectedRoom.name} 已预约成功`,
        position: 'top-right'
      });

      const updated = await fetchBookingsByRoomAndDate(selectedRoom.id, selectedDate);
      setDayBookings(updated);
      
      const all = await useBookingStore.getState().fetchBookings();
      setAllBookings(useBookingStore.getState().bookings);
    } catch (error) {
      toast.error('预约失败', {
        description: error instanceof Error ? error.message : '请稍后重试',
        position: 'top-right'
      });
    }
  };

  if (roomsLoading && rooms.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">选择会议室</h2>
          <p className="text-slate-600">点击选择您需要预约的会议室</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {rooms.map(room => (
            <RoomCard
              key={room.id}
              room={room}
              selected={selectedRoom?.id === room.id}
              onClick={() => handleRoomSelect(room)}
            />
          ))}
        </div>

        {selectedRoom && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Calendar
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  bookings={allBookings.filter(b => b.roomId === selectedRoom.id)}
                />
              </div>

              <div className="lg:col-span-2 space-y-8">
                <TimeSlot
                  selectedSlot={selectedTimeSlot}
                  onSlotSelect={setSelectedTimeSlot}
                  bookings={dayBookings}
                  disabled={!selectedRoom || selectedDate < getToday()}
                />

                <BookingForm
                  room={selectedRoom}
                  date={selectedDate}
                  timeSlot={selectedTimeSlot}
                  onSubmit={handleSubmit}
                  loading={bookingLoading}
                />
              </div>
            </div>
          </div>
        )}

        {!selectedRoom && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">请先选择一个会议室</h3>
            <p className="text-slate-600">点击上方的会议室卡片开始预约</p>
          </div>
        )}
      </div>
    </div>
  );
}
