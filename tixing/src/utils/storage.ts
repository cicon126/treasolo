import Taro from '@tarojs/taro';
import { TodoItem, AppSettings, DEFAULT_SETTINGS } from '@/types/todo';

const TODO_STORAGE_KEY = 'todo_list';
const SETTINGS_STORAGE_KEY = 'app_settings';

export const storage = {
  async getTodos(): Promise<TodoItem[]> {
    try {
      const res = await Taro.getStorage({ key: TODO_STORAGE_KEY });
      return res.data || [];
    } catch (error) {
      console.error('[Storage] getTodos error:', error);
      return [];
    }
  },

  async setTodos(todos: TodoItem[]): Promise<void> {
    try {
      await Taro.setStorage({ key: TODO_STORAGE_KEY, data: todos });
    } catch (error) {
      console.error('[Storage] setTodos error:', error);
    }
  },

  async addTodo(todo: TodoItem): Promise<void> {
    const todos = await this.getTodos();
    todos.unshift(todo);
    await this.setTodos(todos);
  },

  async updateTodo(updatedTodo: TodoItem): Promise<void> {
    const todos = await this.getTodos();
    const index = todos.findIndex(t => t.id === updatedTodo.id);
    if (index !== -1) {
      todos[index] = updatedTodo;
      await this.setTodos(todos);
    }
  },

  async deleteTodo(id: string): Promise<void> {
    const todos = await this.getTodos();
    const filtered = todos.filter(t => t.id !== id);
    await this.setTodos(filtered);
  },

  async getSettings(): Promise<AppSettings> {
    try {
      const res = await Taro.getStorage({ key: SETTINGS_STORAGE_KEY });
      return { ...DEFAULT_SETTINGS, ...res.data };
    } catch (error) {
      console.error('[Storage] getSettings error:', error);
      return { ...DEFAULT_SETTINGS };
    }
  },

  async setSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      const current = await this.getSettings();
      await Taro.setStorage({ 
        key: SETTINGS_STORAGE_KEY, 
        data: { ...current, ...settings } 
      });
    } catch (error) {
      console.error('[Storage] setSettings error:', error);
    }
  }
};
