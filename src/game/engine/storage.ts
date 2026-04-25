const STORAGE_KEYS = {
  currentLevel: 'lumen_current_level',
  completedLevels: 'lumen_completed_levels',
  isFirstVisit: 'lumen_first_visit',
  soundEnabled: 'lumen_sound_enabled',
};

export interface GameSaveData {
  currentLevel: number;
  completedLevels: number[];
  isFirstVisit: boolean;
  soundEnabled: boolean;
}

export function loadGameData(): GameSaveData {
  try {
    if (typeof localStorage === 'undefined') {
      return {
        currentLevel: 0,
        completedLevels: [],
        isFirstVisit: true,
        soundEnabled: true,
      };
    }

    const currentLevel = localStorage.getItem(STORAGE_KEYS.currentLevel);
    const completedLevels = localStorage.getItem(STORAGE_KEYS.completedLevels);
    const isFirstVisit = localStorage.getItem(STORAGE_KEYS.isFirstVisit);
    const soundEnabled = localStorage.getItem(STORAGE_KEYS.soundEnabled);

    return {
      currentLevel: currentLevel ? parseInt(currentLevel, 10) : 0,
      completedLevels: completedLevels ? JSON.parse(completedLevels) : [],
      isFirstVisit: isFirstVisit === null,
      soundEnabled: soundEnabled === null ? true : soundEnabled === 'true',
    };
  } catch (error) {
    console.warn('Failed to load game data:', error);
    return {
      currentLevel: 0,
      completedLevels: [],
      isFirstVisit: true,
      soundEnabled: true,
    };
  }
}

export function saveGameData(data: Partial<GameSaveData>): void {
  try {
    if (typeof localStorage === 'undefined') {
      return;
    }

    if (data.currentLevel !== undefined) {
      localStorage.setItem(STORAGE_KEYS.currentLevel, data.currentLevel.toString());
    }
    if (data.completedLevels !== undefined) {
      localStorage.setItem(STORAGE_KEYS.completedLevels, JSON.stringify(data.completedLevels));
    }
    if (data.isFirstVisit !== undefined) {
      localStorage.setItem(STORAGE_KEYS.isFirstVisit, data.isFirstVisit.toString());
    }
    if (data.soundEnabled !== undefined) {
      localStorage.setItem(STORAGE_KEYS.soundEnabled, data.soundEnabled.toString());
    }
  } catch (error) {
    console.warn('Failed to save game data:', error);
  }
}

export function clearGameData(): void {
  try {
    if (typeof localStorage === 'undefined') {
      return;
    }

    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.warn('Failed to clear game data:', error);
  }
}

export function markLevelComplete(levelId: number): void {
  const data = loadGameData();
  if (!data.completedLevels.includes(levelId)) {
    data.completedLevels.push(levelId);
    saveGameData({ completedLevels: data.completedLevels });
  }
}

export function isLevelCompleted(levelId: number): boolean {
  const data = loadGameData();
  return data.completedLevels.includes(levelId);
}
