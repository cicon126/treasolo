import { User, Message } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    nickname: '阳光少年',
    avatar: 'https://picsum.photos/id/64/200/200',
    bio: '热爱生活，热爱编程，喜欢分享技术心得。',
    email: 'sunshine@example.com',
    phone: '13800138001',
    wechat: 'sunshine_wx',
    emailPublic: true,
    phonePublic: false,
    wechatPublic: true,
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    nickname: '星空漫步者',
    avatar: 'https://picsum.photos/id/91/200/200',
    bio: '程序员一枚，喜欢探索新技术。',
    email: 'star@example.com',
    phone: '13800138002',
    wechat: 'star_walker',
    emailPublic: false,
    phonePublic: false,
    wechatPublic: false,
    createdAt: '2024-02-20T14:20:00Z'
  },
  {
    id: '3',
    nickname: '代码诗人',
    avatar: 'https://picsum.photos/id/177/200/200',
    bio: '用代码书写诗意人生。',
    email: 'poet@example.com',
    phone: '13800138003',
    wechat: 'code_poet',
    emailPublic: true,
    phonePublic: true,
    wechatPublic: true,
    createdAt: '2024-03-10T09:15:00Z'
  },
  {
    id: '4',
    nickname: '咖啡爱好者',
    avatar: 'https://picsum.photos/id/338/200/200',
    bio: '一杯咖啡，一段代码，一个故事。',
    email: 'coffee@example.com',
    phone: '13800138004',
    wechat: 'coffee_lover',
    emailPublic: true,
    phonePublic: false,
    wechatPublic: false,
    createdAt: '2024-03-25T16:45:00Z'
  },
  {
    id: '5',
    nickname: '极客小李',
    avatar: 'https://picsum.photos/id/1027/200/200',
    bio: '技术改变世界，代码成就梦想。',
    email: 'geek@example.com',
    phone: '13800138005',
    wechat: 'geek_lee',
    emailPublic: false,
    phonePublic: true,
    wechatPublic: true,
    createdAt: '2024-04-05T11:30:00Z'
  }
];

export const mockCurrentUser: User = {
  id: 'current',
  nickname: '我是用户',
  avatar: 'https://picsum.photos/id/1005/200/200',
  bio: '这是我的个人简介，欢迎交流！',
  email: 'user@example.com',
  phone: '13900139000',
  wechat: 'my_wechat',
  emailPublic: true,
  phonePublic: false,
  wechatPublic: true,
  createdAt: '2024-01-01T00:00:00Z'
};

export const mockMessages: Message[] = [
  {
    id: 'm1',
    userId: '1',
    content: '今天天气真好，适合写代码！大家最近在学习什么新技术呢？',
    createdAt: '2024-05-20T09:30:00Z'
  },
  {
    id: 'm2',
    userId: '2',
    content: '最近在研究 React 18 的新特性，并发渲染真的很强大，推荐大家也了解一下。',
    createdAt: '2024-05-20T10:15:00Z'
  },
  {
    id: 'm3',
    userId: '3',
    content: '分享一个小技巧：在 TypeScript 中使用 satisfies 操作符可以让类型推断更加精准。',
    createdAt: '2024-05-20T11:20:00Z'
  },
  {
    id: 'm4',
    userId: '4',
    content: '周末参加了一个前端技术分享会，收获满满！认识了很多志同道合的朋友。',
    createdAt: '2024-05-20T14:00:00Z'
  },
  {
    id: 'm5',
    userId: '5',
    content: '想问一下大家，你们平时是怎么管理项目中的状态的？Zustand 还是 Redux？',
    createdAt: '2024-05-20T15:30:00Z'
  },
  {
    id: 'm6',
    userId: '1',
    content: '推荐一本书《代码整洁之道》，值得每个程序员反复阅读。',
    createdAt: '2024-05-21T08:45:00Z'
  },
  {
    id: 'm7',
    userId: 'current',
    content: '大家好，我是新来的，请多多指教！',
    createdAt: '2024-05-21T10:00:00Z'
  },
  {
    id: 'm8',
    userId: '3',
    content: '今天解决了一个困扰我三天的 Bug，原来是少写了一个 await...写代码真的要细心啊。',
    createdAt: '2024-05-21T16:20:00Z'
  }
];

export const mockMessagesWithUsers: Message[] = mockMessages.map(msg => ({
  ...msg,
  user: msg.userId === 'current' 
    ? mockCurrentUser 
    : mockUsers.find(u => u.id === msg.userId)
}));
