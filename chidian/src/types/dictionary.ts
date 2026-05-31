export interface Meaning {
  chinese: string;
  english: string;
}

export interface PartOfSpeech {
  type: string;
  chineseType: string;
  meanings: Meaning[];
}

export interface Example {
  english: string;
  chinese: string;
}

export interface WordEntry {
  id: string;
  english: string;
  chinese: string;
  phonetic: string;
  pinyin: string;
  partsOfSpeech: PartOfSpeech[];
  examples: Example[];
  synonyms: string[];
  antonyms: string[];
}

export interface SearchHistoryItem {
  id: string;
  keyword: string;
  timestamp: number;
}

export type LanguageType = 'en' | 'zh' | 'auto';
