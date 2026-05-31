import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Prize, HistoryItem } from '@/types/prize';
import { getPrizes, savePrizes, getHistory, addHistory, clearHistory } from '@/utils/storage';

interface PrizeContextType {
  prizes: Prize[];
  history: HistoryItem[];
  loading: boolean;
  loadPrizes: () => Promise<void>;
  loadHistory: () => Promise<void>;
  addPrize: (prize: Omit<Prize, 'id' | 'createdAt'>) => Promise<void>;
  updatePrize: (id: string, prize: Partial<Prize>) => Promise<void>;
  deletePrize: (id: string) => Promise<void>;
  addHistoryItem: (item: Omit<HistoryItem, 'id' | 'createdAt'>) => Promise<void>;
  clearAllHistory: () => Promise<void>;
}

const PrizeContext = createContext<PrizeContextType | undefined>(undefined);

export const PrizeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPrizes = async () => {
    setLoading(true);
    try {
      const data = await getPrizes();
      setPrizes(data);
    } catch (error) {
      console.error('[PrizeContext] loadPrizes error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (error) {
      console.error('[PrizeContext] loadHistory error:', error);
    }
  };

  const addPrize = async (prize: Omit<Prize, 'id' | 'createdAt'>) => {
    const newPrize: Prize = {
      ...prize,
      id: Date.now().toString(),
      createdAt: Date.now()
    };
    const newPrizes = [...prizes, newPrize];
    await savePrizes(newPrizes);
    setPrizes(newPrizes);
  };

  const updatePrize = async (id: string, prize: Partial<Prize>) => {
    const newPrizes = prizes.map(p => (p.id === id ? { ...p, ...prize } : p));
    await savePrizes(newPrizes);
    setPrizes(newPrizes);
  };

  const deletePrize = async (id: string) => {
    const newPrizes = prizes.filter(p => p.id !== id);
    await savePrizes(newPrizes);
    setPrizes(newPrizes);
  };

  const addHistoryItem = async (item: Omit<HistoryItem, 'id' | 'createdAt'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: Date.now()
    };
    await addHistory(newItem);
    setHistory(prev => [newItem, ...prev].slice(0, 50));
  };

  const clearAllHistory = async () => {
    await clearHistory();
    setHistory([]);
  };

  useEffect(() => {
    loadPrizes();
    loadHistory();
  }, []);

  return (
    <PrizeContext.Provider
      value={{
        prizes,
        history,
        loading,
        loadPrizes,
        loadHistory,
        addPrize,
        updatePrize,
        deletePrize,
        addHistoryItem,
        clearAllHistory
      }}
    >
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
