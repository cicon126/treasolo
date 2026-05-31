import { Prize } from '@/types/prize';

export const mockPrizes: Prize[] = [
  {
    id: '1',
    name: '一等奖',
    image: 'https://picsum.photos/id/1/200/200',
    probability: 5,
    createdAt: Date.now() - 86400000 * 5
  },
  {
    id: '2',
    name: '二等奖',
    image: 'https://picsum.photos/id/2/200/200',
    probability: 10,
    createdAt: Date.now() - 86400000 * 4
  },
  {
    id: '3',
    name: '三等奖',
    image: 'https://picsum.photos/id/3/200/200',
    probability: 15,
    createdAt: Date.now() - 86400000 * 3
  },
  {
    id: '4',
    name: '四等奖',
    image: 'https://picsum.photos/id/6/200/200',
    probability: 20,
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: '5',
    name: '五等奖',
    image: 'https://picsum.photos/id/8/200/200',
    probability: 25,
    createdAt: Date.now() - 86400000
  },
  {
    id: '6',
    name: '谢谢参与',
    image: 'https://picsum.photos/id/9/200/200',
    probability: 25,
    createdAt: Date.now()
  }
];
