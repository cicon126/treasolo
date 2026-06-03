export interface User {
  id: string;
  nickname: string;
  avatar: string;
  bio: string;
  createdAt: string;
}

export interface Message {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  user?: User;
}