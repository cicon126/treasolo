import { User, Message } from '@/types';
import { mockUsers } from '@/data/users';
import { mockMessages } from '@/data/messages';

const CURRENT_USER_KEY = 'current_user';
const MESSAGES_KEY = 'messages';

export const getCurrentUser = (): User => {
  try {
    const stored = Taro.getStorageSync(CURRENT_USER_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('[UserStore] getCurrentUser error:', error);
  }
  return mockUsers.find(u => u.id === 'current') as User;
};

export const saveCurrentUser = (user: User): void => {
  try {
    Taro.setStorageSync(CURRENT_USER_KEY, JSON.stringify(user));
    console.log('[UserStore] User saved successfully');
  } catch (error) {
    console.error('[UserStore] saveCurrentUser error:', error);
  }
};

export const updateCurrentUser = (updates: Partial<User>): User => {
  const currentUser = getCurrentUser();
  const updatedUser = { ...currentUser, ...updates };
  saveCurrentUser(updatedUser);
  return updatedUser;
};

export const getMessages = (): Message[] => {
  try {
    const stored = Taro.getStorageSync(MESSAGES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('[MessageStore] getMessages error:', error);
  }
  return [...mockMessages];
};

export const saveMessages = (messages: Message[]): void => {
  try {
    Taro.setStorageSync(MESSAGES_KEY, JSON.stringify(messages));
    console.log('[MessageStore] Messages saved successfully');
  } catch (error) {
    console.error('[MessageStore] saveMessages error:', error);
  }
};

export const addMessage = (content: string): Message => {
  const currentUser = getCurrentUser();
  const messages = getMessages();
  const newMessage: Message = {
    id: Date.now().toString(),
    userId: currentUser.id,
    content,
    createdAt: new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '-'),
    user: currentUser
  };
  messages.unshift(newMessage);
  saveMessages(messages);
  return newMessage;
};

export const deleteMessage = (messageId: string): boolean => {
  const messages = getMessages();
  const filteredMessages = messages.filter(msg => msg.id !== messageId);
  if (filteredMessages.length < messages.length) {
    saveMessages(filteredMessages);
    console.log('[MessageStore] Message deleted:', messageId);
    return true;
  }
  return false;
};
