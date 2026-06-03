import { Message } from '@/types';
import { mockUsers } from './users';

export const mockMessages: Message[] = [
  {
    id: '1',
    userId: '1',
    content: '今天天气真好，阳光明媚，适合出去走走，心情也跟着好起来了！希望大家都能有美好的一天~',
    createdAt: '2024-06-01 10:30',
    user: mockUsers[0]
  },
  {
    id: '2',
    userId: '2',
    content: '最近在读一本很有意思的书，推荐给大家《活着》，真的很感人。',
    createdAt: '2024-06-02 09:15',
    user: mockUsers[1]
  },
  {
    id: '3',
    userId: '3',
    content: '学习了一个新的编程技巧，分享给大家：使用TypeScript真的能提高开发效率！',
    createdAt: '2024-06-02 14:20',
    user: mockUsers[2]
  },
  {
    id: '4',
    userId: '4',
    content: '周末去爬山了，山顶的风景真的太美了，下次还要去！',
    createdAt: '2024-06-03 08:45',
    user: mockUsers[3]
  },
  {
    id: '5',
    userId: '5',
    content: '今天做了一道新学的菜，味道还不错，继续加油！',
    createdAt: '2024-06-03 12:00',
    user: mockUsers[4]
  },
  {
    id: '6',
    userId: '1',
    content: '人生就像一盒巧克力，你永远不知道下一颗是什么味道。',
    createdAt: '2024-06-04 16:30',
    user: mockUsers[0]
  },
  {
    id: '7',
    userId: '2',
    content: '今天完成了一个小目标，给自己点个赞！继续努力~',
    createdAt: '2024-06-05 11:20',
    user: mockUsers[1]
  },
  {
    id: '8',
    userId: 'current',
    content: '这是我发布的第一条留言，大家好呀！',
    createdAt: '2024-06-05 15:10',
    user: mockUsers[5]
  }
];

export const getMessagesByUserId = (userId: string): Message[] => {
  return mockMessages.filter(msg => msg.userId === userId);
};