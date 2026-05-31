import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Calendar from './components/Calendar';
import EventPanel from './components/EventPanel';
import EventModal from './components/EventModal';
import { CalendarEvent } from './types';
import { formatDateKey } from './utils/lunar';
import { getEventsByDate, getDatesWithEvents, addEvent, updateEvent, deleteEvent } from './utils/storage';

function App() {
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([]);
  const [datesWithEvents, setDatesWithEvents] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const refreshEvents = useCallback(() => {
    setDatesWithEvents(getDatesWithEvents());
    if (selectedDate) {
      setSelectedDateEvents(getEventsByDate(selectedDate));
    }
  }, [selectedDate]);

  useEffect(() => {
    refreshEvents();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      setSelectedDateEvents(getEventsByDate(selectedDate));
    }
  }, [selectedDate]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(today);
  };

  const handleSelectDate = (date: Date) => {
    const isSameAsSelected = selectedDate && 
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate();
    
    setSelectedDate(date);
    setEditingEvent(null);
    
    if (!isSameAsSelected) {
      setIsModalOpen(true);
    }
  };

  const handleOpenAddModal = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, eventData);
    } else {
      addEvent(eventData);
    }
    refreshEvents();
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm('确定要删除这个事项吗？')) {
      deleteEvent(id);
      refreshEvents();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        year={currentYear}
        month={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
      />
      
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Calendar
                year={currentYear}
                month={currentMonth}
                selectedDate={selectedDate}
                datesWithEvents={datesWithEvents}
                onSelectDate={handleSelectDate}
              />
            </div>
            
            <div className="lg:col-span-1 min-h-[500px] lg:min-h-0">
              <EventPanel
                selectedDate={selectedDate}
                events={selectedDateEvents}
                onAddEvent={handleOpenAddModal}
                onEditEvent={handleOpenEditModal}
                onDeleteEvent={handleDeleteEvent}
              />
            </div>
          </div>
        </div>
      </main>
      
      <EventModal
        isOpen={isModalOpen}
        selectedDate={selectedDate}
        editEvent={editingEvent}
        onClose={handleCloseModal}
        onSave={handleSaveEvent}
      />
    </div>
  );
}

export default App;
