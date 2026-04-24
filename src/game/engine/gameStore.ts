import { create } from 'zustand';
import { levels } from '../../levels';
import { raycastLevel } from '../core/raycast';
import type { Level } from '../core/types';

type GameState = {
  levelIndex: number;
  currentLevel: Level;
  solved: boolean;
  hintText: string | null;
  setMirrorAngle: (mirrorId: string, angle: number) => void;
  resetLevel: () => void;
  nextLevel: () => void;
  requestHint: () => void;
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

  setMirrorAngle: (mirrorId, angle) => {
    const state = get();
    const next = cloneLevel(state.currentLevel);
    const mirror = next.mirrors.find((m) => m.id === mirrorId);
    if (!mirror || !mirror.rotatable) return;
    mirror.angle = angle;
    set({
      currentLevel: next,
      solved: isSolved(next),
      hintText: null,
    });
  },

  resetLevel: () => {
    const idx = get().levelIndex;
    const fresh = cloneLevel(levels[idx]);
    set({ currentLevel: fresh, solved: false, hintText: null });
  },

  nextLevel: () => {
    const nextIndex = Math.min(get().levelIndex + 1, levels.length - 1);
    const fresh = cloneLevel(levels[nextIndex]);
    set({ levelIndex: nextIndex, currentLevel: fresh, solved: false, hintText: null });
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
}));
