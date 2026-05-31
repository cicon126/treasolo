export interface Prize {
  id: string;
  name: string;
  probability: number;
  color: string;
  image: string;
}

export interface LotteryRecord {
  id: string;
  prizeId: string;
  prizeName: string;
  prizeImage: string;
  timestamp: number;
}
