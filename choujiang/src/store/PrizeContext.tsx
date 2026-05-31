import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Prize, LotteryRecord } from '@/types/prize';
import { defaultPrizes } from '@/data/defaultPrizes';
import Taro from '@tarojs/taro';

interface PrizeContextType {
  prizes: Prize[];
  records: LotteryRecord[];
  addPrize: (prize: Omit<Prize, 'id'>) => void;
  updatePrize: (id: string, prize: Partial<Prize>) => void;
  deletePrize: (id: string) => void;
  addRecord: (record: LotteryRecord) => void;
  clearRecords: () => void;
}

const PrizeContext = createContext<PrizeContextType | undefined>(undefined);

const STORAGE_KEY_PRIZES = 'lottery_prizes';
const STORAGE_KEY_RECORDS = 'lottery_records';

export const PrizeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [records, setRecords] = useState<LotteryRecord[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedPrizes = await Taro.getStorage({ key: STORAGE_KEY_PRIZES }).catch(() => null);
      const storedRecords = await Taro.getStorage({ key: STORAGE_KEY_RECORDS }).catch(() => null);
      
      if (storedPrizes?.data && storedPrizes.data.length > 0) {
        setPrizes(storedPrizes.data);
      } else {
        setPrizes(defaultPrizes);
        await Taro.setStorage({ key: STORAGE_KEY_PRIZES, data: defaultPrizes });
      }

      if (storedRecords?.data) {
        setRecords(storedRecords.data);
      }
    } catch (error) {
      console.error('[PrizeContext] 加载数据失败', error);
      setPrizes(defaultPrizes);
    }
  };

  const savePrizes = async (newPrizes: Prize[]) => {
    try {
      await Taro.setStorage({ key: STORAGE_KEY_PRIZES, data: newPrizes });
    } catch (error) {
      console.error('[PrizeContext] 保存奖品失败', error);
    }
  };

  const saveRecords = async (newRecords: LotteryRecord[]) => {
    try {
      await Taro.setStorage({ key: STORAGE_KEY_RECORDS, data: newRecords });
    } catch (error) {
      console.error('[PrizeContext] 保存记录失败', error);
    }
  };

  const addPrize = (prize: Omit<Prize, 'id'>) => {
    const newPrize: Prize = {
      ...prize,
      id: Date.now().toString()
    };
    const newPrizes = [...prizes, newPrize];
    setPrizes(newPrizes);
    savePrizes(newPrizes);
  };

  const updatePrize = (id: string, prize: Partial<Prize>) => {
    const newPrizes = prizes.map(p => p.id === id ? { ...p, ...prize } : p);
    setPrizes(newPrizes);
    savePrizes(newPrizes);
  };

  const deletePrize = (id: string) => {
    const newPrizes = prizes.filter(p => p.id !== id);
    setPrizes(newPrizes);
    savePrizes(newPrizes);
  };

  const addRecord = (record: LotteryRecord) => {
    const newRecords = [record, ...records];
    setRecords(newRecords);
    saveRecords(newRecords);
  };

  const clearRecords = () => {
    setRecords([]);
    saveRecords([]);
  };

  return (
    <PrizeContext.Provider value={{
      prizes,
      records,
      addPrize,
      updatePrize,
      deletePrize,
      addRecord,
      clearRecords
    }}>
      {children}
    </PrizeContext.Provider>
  );
};

export const usePrizeContext = () => {
  const context = useContext(PrizeContext);
  if (!context) {
    throw new Error('usePrizeContext must be used within a PrizeProvider');
  }
  return context;
};
