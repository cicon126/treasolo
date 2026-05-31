import Taro from '@tarojs/taro';
import { Prize, HistoryItem } from '@/types/prize';
import { mockPrizes } from '@/data/mockPrizes';

const PRIZES_KEY = 'wheel_prizes';
const HISTORY_KEY = 'wheel_history';

const safeGetStorage = async (key: string): Promise<any> => {
  try {
    const res = await Taro.getStorage({ key });
    return res.data;
  } catch {
    return null;
  }
};

const safeSetStorage = async (key: string, data: any): Promise<void> => {
  try {
    await Taro.setStorage({ key, data });
  } catch (error) {
    console.error(`[Storage] setStorage(${key}) error:`, error);
  }
};

export const getPrizes = async (): Promise<Prize[]> => {
  const data = await safeGetStorage(PRIZES_KEY);
  if (data && Array.isArray(data) && data.length > 0) {
    return data;
  }
  await safeSetStorage(PRIZES_KEY, mockPrizes);
  return mockPrizes;
};

export const savePrizes = async (prizes: Prize[]): Promise<void> => {
  await safeSetStorage(PRIZES_KEY, prizes);
};

export const getHistory = async (): Promise<HistoryItem[]> => {
  const data = await safeGetStorage(HISTORY_KEY);
  if (data && Array.isArray(data)) {
    return data;
  }
  return [];
};

export const addHistory = async (item: HistoryItem): Promise<void> => {
  const history = await getHistory();
  history.unshift(item);
  const limitedHistory = history.slice(0, 50);
  await safeSetStorage(HISTORY_KEY, limitedHistory);
};

export const clearHistory = async (): Promise<void> => {
  try {
    await Taro.removeStorage({ key: HISTORY_KEY });
  } catch (error) {
    console.error('[Storage] clearHistory error:', error);
  }
};
