import { create } from 'zustand';
import { levels } from '../../levels';
import { raycastLevel } from '../core/raycast';
import type { Level, HintMirror } from '../core/types';
import type { RaycastResult } from './stateTypes';
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
  hintMirrorAngles: HintMirror[];
  hintMode: boolean;
  showMenu: boolean;
  paused: boolean;
  clearScreen: boolean;
  rayResult: RaycastResult;
  setMirrorAngle: (mirrorId: string, angle: number) => void;
  updateHintAngle: (mirrorId: string, angle: number) => void;
  setActiveMirror: (mirrorId: string | null) => void;
  resetLevel: () => void;
  nextLevel: () => void;
  previousLevel: () => void;
  requestHint: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  initializeGame: () => void;
  setLevelByIndex: (index: number) => void;
  setShowMenu: (show: boolean) => void;
  setPaused: (paused: boolean) => void;
  setClearScreen: (show: boolean) => void;
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

function calculateHintAngles(level: Level): HintMirror[] {
  const hints: HintMirror[] = [];
  
  for (const mirror of level.mirrors) {
    if (!mirror.rotatable) continue;
    
    let bestAngle = mirror.angle;
    let bestScore = 0;
    
    for (let angle = -89; angle <= 89; angle += 1) {
      const testMirror = { ...mirror, angle };
      const testLevel = { ...level, mirrors: level.mirrors.map(m => m.id === mirror.id ? testMirror : m) };
      const result = raycastLevel(testLevel);
      
      let score = 0;
      for (const target of level.targets) {
        for (const seg of result.segments) {
          const dx = target.x - seg.from.x;
          const dy = target.y - seg.from.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 5) continue;
          
          const segDx = seg.to.x - seg.from.x;
          const segDy = seg.to.y - seg.from.y;
          const segLen = Math.sqrt(segDx * segDx + segDy * segDy);
          if (segLen < 5) continue;
          
          const t = ((target.x - seg.from.x) * segDx + (target.y - seg.from.y) * segDy) / (segLen * segLen);
          if (t >= 0 && t <= 1) {
            const projX = seg.from.x + t * segDx;
            const projY = seg.from.y + t * segDy;
            const dist = Math.sqrt((target.x - projX) ** 2 + (target.y - projY) ** 2);
            if (dist < target.r * 2) {
              score += Math.max(0, target.r * 2 - dist);
            }
          }
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestAngle = angle;
      }
    }
    
    hints.push({ id: mirror.id, angle: bestAngle });
  }
  
  return hints;
}

export const useGameStore = create<GameState>((set, get) => {
  const initialLevel = cloneLevel(levels[0]);
  const initialRayResult = raycastLevel(initialLevel);
  
  let clearScreenTimer: ReturnType<typeof setTimeout> | null = null;
  
  return {
    levelIndex: 0,
    currentLevel: initialLevel,
    solved: false,
    hintText: null,
    activeMirrorId: null,
    soundEnabled: true,
    completedLevels: [],
    frozen: false,
    hintMirrorAngles: [],
    hintMode: false,
    showMenu: true,
    paused: false,
    clearScreen: false,
    rayResult: initialRayResult,

    initializeGame: () => {
      const data = loadGameData();
      const levelIndex = Math.min(data.currentLevel, levels.length - 1);
      const fresh = cloneLevel(levels[levelIndex]);
      const rayResult = raycastLevel(fresh);
      set({
        levelIndex,
        currentLevel: fresh,
        solved: false,
        hintText: null,
        activeMirrorId: null,
        soundEnabled: data.soundEnabled,
        completedLevels: data.completedLevels,
        hintMirrorAngles: [],
        hintMode: false,
        rayResult,
      });
    },

    setMirrorAngle: (mirrorId, angle) => {
      const state = get();
      if (state.frozen || state.solved) return;
      
      const next = cloneLevel(state.currentLevel);
      const mirror = next.mirrors.find((m) => m.id === mirrorId);
      if (!mirror || !mirror.rotatable) return;
      mirror.angle = angle;
      
      const rayResult = raycastLevel(next);
      const solved = rayResult.hitTargetIds.length === next.targets.length;
      
      set({
        currentLevel: next,
        solved,
        hintText: null,
        frozen: solved,
        hintMirrorAngles: [],
        hintMode: false,
        rayResult,
      });

      if (solved && !state.completedLevels.includes(state.levelIndex + 1)) {
        const newCompletedLevels = [...state.completedLevels, state.levelIndex + 1];
        set({ completedLevels: newCompletedLevels });
        markLevelComplete(state.levelIndex + 1);
        
        if (clearScreenTimer) {
          clearTimeout(clearScreenTimer);
        }
        
        clearScreenTimer = setTimeout(() => {
          set({ clearScreen: true });
          clearScreenTimer = null;
        }, 1600);
      }

      saveGameData({ currentLevel: state.levelIndex });
    },

    updateHintAngle: (mirrorId, angle) => {
      const state = get();
      if (!state.hintMode) return;
      
      const newHints = state.hintMirrorAngles.map(h => 
        h.id === mirrorId ? { ...h, angle } : h
      );
      set({ hintMirrorAngles: newHints });
    },

    setActiveMirror: (mirrorId) => {
      set({ activeMirrorId: mirrorId });
    },

    resetLevel: () => {
      if (clearScreenTimer) {
        clearTimeout(clearScreenTimer);
        clearScreenTimer = null;
      }
      const idx = get().levelIndex;
      const fresh = cloneLevel(levels[idx]);
      const rayResult = raycastLevel(fresh);
      set({ 
        currentLevel: fresh, 
        solved: false, 
        hintText: null, 
        activeMirrorId: null,
        hintMirrorAngles: [],
        hintMode: false,
        rayResult,
      });
      saveGameData({ currentLevel: idx });
    },

    nextLevel: () => {
      if (clearScreenTimer) {
        clearTimeout(clearScreenTimer);
        clearScreenTimer = null;
      }
      const nextIndex = Math.min(get().levelIndex + 1, levels.length - 1);
      const fresh = cloneLevel(levels[nextIndex]);
      const rayResult = raycastLevel(fresh);
      set({ 
        levelIndex: nextIndex, 
        currentLevel: fresh, 
        solved: false, 
        hintText: null, 
        activeMirrorId: null,
        frozen: false,
        clearScreen: false,
        hintMirrorAngles: [],
        hintMode: false,
        rayResult,
      });
      saveGameData({ currentLevel: nextIndex });
    },

    previousLevel: () => {
      if (clearScreenTimer) {
        clearTimeout(clearScreenTimer);
        clearScreenTimer = null;
      }
      const prevIndex = Math.max(get().levelIndex - 1, 0);
      const fresh = cloneLevel(levels[prevIndex]);
      const rayResult = raycastLevel(fresh);
      set({ 
        levelIndex: prevIndex, 
        currentLevel: fresh, 
        solved: false, 
        hintText: null, 
        activeMirrorId: null,
        frozen: false,
        hintMirrorAngles: [],
        hintMode: false,
        rayResult,
      });
      saveGameData({ currentLevel: prevIndex });
    },

    requestHint: () => {
      const state = get();
      
      if (state.hintMode) {
        set({ hintMode: false, hintMirrorAngles: [], hintText: null });
        return;
      }
      
      const rotatable = state.currentLevel.mirrors.filter((m) => m.rotatable);
      if (!rotatable.length) {
        set({ hintText: '本关无可旋转镜子', hintMode: false, hintMirrorAngles: [] });
        return;
      }
      
      const hintAngles = calculateHintAngles(state.currentLevel);
      set({ 
        hintText: '拖动虚影镜子到正确位置！',
        hintMirrorAngles: hintAngles,
        hintMode: true,
      });
    },

    setSoundEnabled: (enabled) => {
      set({ soundEnabled: enabled });
      saveGameData({ soundEnabled: enabled });
    },

    setLevelByIndex: (index) => {
      if (clearScreenTimer) {
        clearTimeout(clearScreenTimer);
        clearScreenTimer = null;
      }
      const validIndex = Math.max(0, Math.min(index, levels.length - 1));
      const fresh = cloneLevel(levels[validIndex]);
      const rayResult = raycastLevel(fresh);
      set({
        levelIndex: validIndex,
        currentLevel: fresh,
        solved: false,
        hintText: null,
        activeMirrorId: null,
        frozen: false,
        hintMirrorAngles: [],
        hintMode: false,
        showMenu: false,
        clearScreen: false,
        rayResult,
      });
      saveGameData({ currentLevel: validIndex });
    },

    setShowMenu: (show) => {
      set({ showMenu: show });
    },

    setClearScreen: (show) => {
      if (!show && clearScreenTimer) {
        clearTimeout(clearScreenTimer);
        clearScreenTimer = null;
      }
      set({ clearScreen: show });
    },

    setPaused: (paused) => {
      set({ paused: paused });
    },
  };
});
