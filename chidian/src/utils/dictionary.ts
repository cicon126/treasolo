import type { WordEntry } from '@/types/dictionary';
import { dictionaryData } from '@/data/dictionary';

export function isChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}

export function searchWords(keyword: string): WordEntry[] {
  if (!keyword.trim()) return [];
  const lower = keyword.toLowerCase().trim();
  return dictionaryData.filter((word) => {
    return (
      word.english.toLowerCase().includes(lower) ||
      word.chinese.includes(keyword) ||
      word.pinyin.toLowerCase().includes(lower) ||
      word.partsOfSpeech.some((pos) =>
        pos.meanings.some(
          (m) =>
            m.chinese.includes(keyword) ||
            m.english.toLowerCase().includes(lower)
        )
      )
    );
  });
}

export function getDailyWord(): WordEntry {
  const dayIndex = new Date().getDate() % dictionaryData.length;
  return dictionaryData[dayIndex];
}

export function getWordById(id: string): WordEntry | undefined {
  return dictionaryData.find((word) => word.id === id);
}

export function getWordsByIds(ids: string[]): WordEntry[] {
  return ids
    .map((id) => dictionaryData.find((word) => word.id === id))
    .filter((word): word is WordEntry => word !== undefined);
}
