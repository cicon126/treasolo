export interface User {
  id: string;
  nickname: string;
  avatar: string;
  bio: string;
  email: string;
  phone: string;
  wechat: string;
  emailPublic: boolean;
  phonePublic: boolean;
  wechatPublic: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  user?: User;
}

export interface AppState {
  currentUser: User | null;
  messages: Message[];
  setCurrentUser: (user: User) => void;
  updateCurrentUser: (updates: Partial<User>) => void;
  addMessage: (message: Message) => void;
  deleteMessage: (messageId: string) => void;
  setMessages: (messages: Message[]) => void;
}
