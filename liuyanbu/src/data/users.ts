import { User } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    nickname: '阳光少年',
    avatar: 'https://picsum.photos/id/64/200/200',
    bio: '热爱生活，喜欢分享每一天的美好',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    nickname: '星空漫步者',
    avatar: 'https://picsum.photos/id/91/200/200',
    bio: '在这个星球上留下我的足迹',
    createdAt: '2024-02-20'
  },
  {
    id: '3',
    nickname: '代码诗人',
    avatar: 'https://picsum.photos/id/177/200/200',
    bio: '用代码书写生活的诗意',
    createdAt: '2024-03-10'
  },
  {
    id: '4',
    nickname: '追梦人',
    avatar: 'https://picsum.photos/id/338/200/200',
    bio: '追逐梦想，永不停歇',
    createdAt: '2024-03-25'
  },
  {
    id: '5',
    nickname: '快乐小猫',
    avatar: 'https://picsum.photos/id/1027/200/200',
    bio: '喵喵喵，生活就要简单快乐',
    createdAt: '2024-04-05'
  },
  {
    id: 'current',
    nickname: '我是留言者',
    avatar: 'https://picsum.photos/id/64/200/200',
    bio: '这是我的个人简介，欢迎查看',
    createdAt: '2024-01-01'
  }
];

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};