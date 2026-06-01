import { create } from 'zustand';
import { AppState, User, Message } from '@/types';
import { mockCurrentUser, mockMessagesWithUsers } from '@/data/mockData';

export const useStore = create<AppState>((set) => ({
  currentUser: mockCurrentUser,
  messages: mockMessagesWithUsers,

  setCurrentUser: (user: User) => {
    console.log('[Store] setCurrentUser', user);
    set({ currentUser: user });
  },

  updateCurrentUser: (updates: Partial<User>) => {
    console.log('[Store] updateCurrentUser', updates);
    set((state) => ({
      currentUser: state.currentUser
        ? { ...state.currentUser, ...updates }
        : null
    }));
  },

  addMessage: (message: Message) => {
    console.log('[Store] addMessage', message);
    set((state) => ({
      messages: [message, ...state.messages]
    }));
  },

  deleteMessage: (messageId: string) => {
    console.log('[Store] deleteMessage', messageId);
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== messageId)
    }));
  },

  setMessages: (messages: Message[]) => {
    console.log('[Store] setMessages', messages.length);
    set({ messages });
  }
}));
