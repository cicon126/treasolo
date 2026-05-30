import { useState, useEffect, useCallback } from 'react';
import { TodoItem, AppSettings, DEFAULT_SETTINGS } from '@/types/todo';
import { storage } from '@/utils/storage';
import { reminder } from '@/utils/reminder';

let globalTodos: TodoItem[] = [];
let globalSettings: AppSettings = { ...DEFAULT_SETTINGS };
let listeners: Array<() => void> = [];

const notifyListeners = () => {
  listeners.forEach(l => l());
};

export const useTodoStore = () => {
  const [todos, setTodos] = useState<TodoItem[]>(globalTodos);
  const [settings, setSettings] = useState<AppSettings>(globalSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const listener = () => {
      setTodos([...globalTodos]);
      setSettings({ ...globalSettings });
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  useEffect(() => {
    initStore();
  }, []);

  const initStore = async () => {
    try {
      const [savedTodos, savedSettings] = await Promise.all([
        storage.getTodos(),
        storage.getSettings()
      ]);
      globalTodos = savedTodos;
      globalSettings = savedSettings;
      notifyListeners();
    } catch (error) {
      console.error('[Store] init error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = useCallback(async (content: string, remindTime: string) => {
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      content,
      remindTime,
      isCompleted: false,
      isReminded: false,
      createdAt: new Date().toISOString()
    };
    globalTodos = [newTodo, ...globalTodos];
    notifyListeners();
    await storage.addTodo(newTodo);
  }, []);

  const toggleComplete = useCallback(async (id: string) => {
    globalTodos = globalTodos.map(t => 
      t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
    );
    notifyListeners();
    const todo = globalTodos.find(t => t.id === id);
    if (todo) await storage.updateTodo(todo);
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    globalTodos = globalTodos.filter(t => t.id !== id);
    notifyListeners();
    await storage.deleteTodo(id);
  }, []);

  const markAsReminded = useCallback(async (id: string) => {
    globalTodos = globalTodos.map(t => 
      t.id === id ? { ...t, isReminded: true } : t
    );
    notifyListeners();
    const todo = globalTodos.find(t => t.id === id);
    if (todo) await storage.updateTodo(todo);
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    globalSettings = { ...globalSettings, ...newSettings };
    notifyListeners();
    await storage.setSettings(newSettings);
  }, []);

  const checkAndRemind = useCallback(async () => {
    if (!settings.enableReminder) return [];

    const toRemind = reminder.checkReminders(todos, settings.remindAdvanceMinutes);
    
    for (const todo of toRemind) {
      reminder.vibrate();
      
      if (settings.enableVoice) {
        reminder.speak(`提醒：${todo.content}，将在${settings.remindAdvanceMinutes}分钟后开始`);
      }

      const confirmed = await reminder.showModal(todo);
      if (confirmed) {
        await markAsReminded(todo.id);
      }
    }

    return toRemind;
  }, [todos, settings, markAsReminded]);

  return {
    todos,
    settings,
    loading,
    addTodo,
    toggleComplete,
    deleteTodo,
    markAsReminded,
    updateSettings,
    checkAndRemind,
    pendingTodos: todos.filter(t => !t.isCompleted),
    completedTodos: todos.filter(t => t.isCompleted)
  };
};
