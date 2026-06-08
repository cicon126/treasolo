const STORAGE_KEY = 'snake_game_data';

export interface StorageData {
  highScore: number;
  unlockedLevels: number[];
  lastPlayedLevel: number;
}

const defaultData: StorageData = {
  highScore: 0,
  unlockedLevels: [1],
  lastPlayedLevel: 1,
};

export function loadGameData(): StorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultData };
    const parsed = JSON.parse(raw) as StorageData;
    return {
      highScore: parsed.highScore ?? 0,
      unlockedLevels: parsed.unlockedLevels ?? [1],
      lastPlayedLevel: parsed.lastPlayedLevel ?? 1,
    };
  } catch {
    return { ...defaultData };
  }
}

export function saveGameData(data: Partial<StorageData>): void {
  try {
    const current = loadGameData();
    const merged: StorageData = { ...current, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // ignore
  }
}

export function unlockLevel(level: number): void {
  const data = loadGameData();
  if (!data.unlockedLevels.includes(level)) {
    data.unlockedLevels.push(level);
    saveGameData({ unlockedLevels: data.unlockedLevels });
  }
}

export function updateHighScore(score: number): void {
  const data = loadGameData();
  if (score > data.highScore) {
    saveGameData({ highScore: score });
  }
}
