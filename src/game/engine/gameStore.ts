import { create } from 'zustand';
import { levels } from '../../levels';
import { raycastLevel } from '../core/raycast';
import type { Level } from '../core/types';
import { loadGameData, saveGameData, markLevelComplete } from './storage';

type GameState = {
  levelIndex: number;
  currentLevel: Level;
  solved: boolean;
  hintText: string | null;
  activeMirrorId: string | null;
  soundEnabled: boolean;
  completedLevels: number[];
  frozen: boolean;
  setMirrorAngle: (mirrorId: string, angle: number) => void;
  setActiveMirror: (mirrorId: string | null) => void;
  resetLevel: () => void;
  nextLevel: () => void;
  previousLevel: () => void;
  requestHint: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  initializeGame: () => void;
};

function cloneLevel(level: Level): Level {
  return {
    ...level,
    emitter: { ...level.emitter },
    mirrors: level.mirrors.map((m) => ({ ...m })),
    targets: level.targets.map((t) => ({ ...t })),
    obstacles: level.obstacles.map((o) => ({ ...o })),
  };
}

function isSolved(level: Level): boolean {
  const result = raycastLevel(level);
  return result.hitTargetIds.length === level.targets.length;
}

export const useGameStore = create<GameState>((set, get) => ({
  levelIndex: 0,
  currentLevel: cloneLevel(levels[0]),
  solved: false,
  hintText: null,
  activeMirrorId: null,
  soundEnabled: true,
  completedLevels: [],
  frozen: false,

  initializeGame: () => {
    const data = loadGameData();
    const levelIndex = Math.min(data.currentLevel, levels.length - 1);
    const fresh = cloneLevel(levels[levelIndex]);
    set({
      levelIndex,
      currentLevel: fresh,
      solved: false,
      hintText: null,
      activeMirrorId: null,
      soundEnabled: data.soundEnabled,
      completedLevels: data.completedLevels,
    });
  },

  setMirrorAngle: (mirrorId, angle) => {
    const state = get();
    if (state.frozen || state.solved) return;
    const next = cloneLevel(state.currentLevel);
    const mirror = next.mirrors.find((m) => m.id === mirrorId);
    if (!mirror || !mirror.rotatable) return;
    mirror.angle = angle;
    const solved = isSolved(next);
    
    set({
      currentLevel: next,
      solved,
      hintText: null,
      frozen: solved,
    });

    if (solved && !state.completedLevels.includes(state.levelIndex + 1)) {
      const newCompletedLevels = [...state.completedLevels, state.levelIndex + 1];
      set({ completedLevels: newCompletedLevels });
      markLevelComplete(state.levelIndex + 1);
    }

    saveGameData({ currentLevel: state.levelIndex });
  },

  setActiveMirror: (mirrorId) => {
    set({ activeMirrorId: mirrorId });
  },

  resetLevel: () => {
    const idx = get().levelIndex;
    const fresh = cloneLevel(levels[idx]);
    set({ currentLevel: fresh, solved: false, hintText: null, activeMirrorId: null });
    saveGameData({ currentLevel: idx });
  },

  nextLevel: () => {
    const nextIndex = Math.min(get().levelIndex + 1, levels.length - 1);
    const fresh = cloneLevel(levels[nextIndex]);
    set({ 
      levelIndex: nextIndex, 
      currentLevel: fresh, 
      solved: false, 
      hintText: null, 
      activeMirrorId: null,
      frozen: false,
    });
    saveGameData({ currentLevel: nextIndex });
  },

  previousLevel: () => {
    const prevIndex = Math.max(get().levelIndex - 1, 0);
    const fresh = cloneLevel(levels[prevIndex]);
    set({ 
      levelIndex: prevIndex, 
      currentLevel: fresh, 
      solved: false, 
      hintText: null, 
      activeMirrorId: null,
      frozen: false,
    });
    saveGameData({ currentLevel: prevIndex });
  },

  requestHint: () => {
    const state = get();
    const rotatable = state.currentLevel.mirrors.filter((m) => m.rotatable);
    if (!rotatable.length) {
      set({ hintText: '本关无可旋转镜子' });
      return;
    }
    const mirror = rotatable[0];
    set({ hintText: `尝试先调整镜子 ${mirror.id} 到约 ${Math.round(mirror.angle + 15)}°` });
  },

  setSoundEnabled: (enabled) => {
    set({ soundEnabled: enabled });
    saveGameData({ soundEnabled: enabled });
  },
}));
