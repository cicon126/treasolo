import { create } from 'zustand';
import type { SearchHistoryItem } from '@/types/dictionary';

interface DictionaryState {
  searchHistory: SearchHistoryItem[];
  vocabularyIds: string[];
  addSearchHistory: (keyword: string) => void;
  clearSearchHistory: () => void;
  addVocabulary: (id: string) => void;
  removeVocabulary: (id: string) => void;
  isInVocabulary: (id: string) => boolean;
}

export const useDictionaryStore = create<DictionaryState>((set, get) => ({
  searchHistory: [],
  vocabularyIds: [],

  addSearchHistory: (keyword: string) => {
    set((state) => {
      const filtered = state.searchHistory.filter((item) => item.keyword !== keyword);
      const newItem: SearchHistoryItem = {
        id: Date.now().toString(),
        keyword,
        timestamp: Date.now()
      };
      return {
        searchHistory: [newItem, ...filtered].slice(0, 50)
      };
    });
  },

  clearSearchHistory: () => {
    set({ searchHistory: [] });
  },

  addVocabulary: (id: string) => {
    set((state) => {
      if (state.vocabularyIds.includes(id)) return state;
      return { vocabularyIds: [...state.vocabularyIds, id] };
    });
  },

  removeVocabulary: (id: string) => {
    set((state) => ({
      vocabularyIds: state.vocabularyIds.filter((vid) => vid !== id)
    }));
  },

  isInVocabulary: (id: string) => {
    return get().vocabularyIds.includes(id);
  }
}));
