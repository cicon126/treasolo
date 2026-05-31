export interface Prize {
  id: string;
  name: string;
  image: string;
  probability: number;
  createdAt: number;
}

export interface HistoryItem {
  id: string;
  prizeId: string;
  prizeName: string;
  prizeImage: string;
  createdAt: number;
}
