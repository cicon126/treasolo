import { useState, useEffect } from 'react';
import { X, Clock, FileText } from 'lucide-react';
import { CalendarEvent } from '../types';
import { formatDateKey } from '../utils/lunar';

interface EventModalProps {
  isOpen: boolean;
  selectedDate: Date | null;
  editEvent?: CalendarEvent | null;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => void;
}

export default function EventModal({ isOpen, selectedDate, editEvent, onClose, onSave }: EventModalProps) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editEvent) {
      setTitle(editEvent.title);
      setTime(editEvent.time || '');
      setDescription(editEvent.description || '');
    } else {
      setTitle('');
      setTime('');
      setDescription('');
    }
  }, [editEvent, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedDate) return;
    
    onSave({
      title: title.trim(),
      date: formatDateKey(selectedDate),
      time: time || undefined,
      description: description.trim() || undefined
    });
    onClose();
  };

  if (!isOpen || !selectedDate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-gradient-to-br from-indigo-900/95 to-purple-900/95 rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            {editEvent ? '编辑事项' : '添加事项'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              日期
            </label>
            <div className="px-4 py-3 bg-white/5 rounded-lg text-white">
              {formatDateKey(selectedDate)}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              事项标题 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入事项标题"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
              autoFocus
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              时间
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              备注
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="添加备注信息..."
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all resize-none"
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold rounded-lg transition-all hover:scale-105"
            >
              {editEvent ? '保存' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
