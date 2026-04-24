import levelsData from './levels.json';
import type { Level, Mirror, Obstacle, Target } from '../game/core/types';

type RawLevel = {
  id: number;
  emitter: { x: number; y: number; angle: number };
  mirrors: Array<{ id?: string; x: number; y: number; length: number; angle: number; rotatable: boolean }>;
  targets: Array<{ id?: string; x: number; y: number; r: number }>;
  obstacles: Array<{ id?: string; x: number; y: number; w: number; h: number }>;
};

function withIds(level: RawLevel): Level {
  const mirrors: Mirror[] = level.mirrors.map((m, i) => ({ 
    ...m, 
    id: m.id || `m_${level.id}_${i}` 
  }));
  const targets: Target[] = level.targets.map((t, i) => ({ 
    ...t, 
    id: t.id || `t_${level.id}_${i}` 
  }));
  const obstacles: Obstacle[] = level.obstacles.map((o, i) => ({ 
    ...o, 
    id: o.id || `o_${level.id}_${i}` 
  }));

  return {
    id: level.id,
    emitter: level.emitter,
    mirrors,
    targets,
    obstacles,
  };
}

export const levels: Level[] = (levelsData as RawLevel[]).map(withIds);
