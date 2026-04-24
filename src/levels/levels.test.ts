import { describe, it, expect } from 'vitest';
import { levels } from './index';
import { raycastLevel } from '../game/core/raycast';

describe('Level Verification', () => {
  it('all levels should have correct structure', () => {
    levels.forEach(level => {
      expect(level.id).toBeDefined();
      expect(level.emitter).toBeDefined();
      expect(Array.isArray(level.mirrors)).toBe(true);
      expect(Array.isArray(level.targets)).toBe(true);
      expect(Array.isArray(level.obstacles)).toBe(true);
      
      level.mirrors.forEach(mirror => {
        expect(mirror.id).toBeDefined();
        expect(mirror.rotatable).toBeDefined();
      });
      
      level.targets.forEach(target => {
        expect(target.id).toBeDefined();
      });
    });
  });

  it('difficulty progression should be reasonable', () => {
    const easyLevels = levels.slice(0, 5);
    const mediumLevels = levels.slice(4, 9);
    const hardLevels = levels.slice(8, 14);
    const expertLevels = levels.slice(14, 20);

    expect(easyLevels.every(l => l.mirrors.length <= 2 && l.targets.length === 1 && l.obstacles.length <= 1)).toBe(true);
    expect(mediumLevels.every(l => l.mirrors.length >= 2 && l.targets.length === 1 && l.obstacles.length >= 0)).toBe(true);
    expect(hardLevels.every(l => l.obstacles.length >= 1)).toBe(true);
    expect(expertLevels.every(l => l.targets.length >= 2)).toBe(true);
  });

  it('ray tracing should detect direct hits', () => {
    const level = {
      id: 999,
      emitter: { x: 0, y: 0, angle: 0 },
      mirrors: [],
      targets: [{ id: 't1', x: 100, y: 0, r: 20 }],
      obstacles: [],
    };

    const result = raycastLevel(level);
    expect(result.hitTargetIds).toContain('t1');
  });

  it('total level count should be 20', () => {
    expect(levels).toHaveLength(20);
  });

  it('mirror hit detection should work', () => {
    const level = {
      id: 998,
      emitter: { x: 0, y: 100, angle: 0 },
      mirrors: [{ id: 'm1', x: 50, y: 100, length: 100, angle: 45, rotatable: true }],
      targets: [{ id: 't1', x: 50, y: 0, r: 20 }],
      obstacles: [],
    };

    const result = raycastLevel(level);
    expect(result.segments.length).toBeGreaterThan(0);
  });

  it('obstacles should block rays', () => {
    const level = {
      id: 997,
      emitter: { x: 0, y: 100, angle: 0 },
      mirrors: [],
      targets: [{ id: 't1', x: 200, y: 100, r: 20 }],
      obstacles: [{ id: 'o1', x: 100, y: 0, w: 10, h: 200 }],
    };

    const result = raycastLevel(level);
    expect(result.hitTargetIds).not.toContain('t1');
  });
});
