import { describe, it, expect } from 'vitest';
import { levels } from './index';
import { raycastLevel } from '../game/core/raycast';

describe('All 20 Levels Raycast Test', () => {
  levels.forEach((level) => {
    it(`Level ${level.id} should generate ray segments`, () => {
      const result = raycastLevel(level);
      expect(result.segments.length).toBeGreaterThan(0);
    });

    it(`Level ${level.id} should have valid structure`, () => {
      expect(level.emitter).toBeDefined();
      expect(level.emitter.x).toBeGreaterThan(0);
      expect(level.emitter.y).toBeGreaterThan(0);
      expect(level.mirrors.length).toBeGreaterThan(0);
      expect(level.targets.length).toBeGreaterThan(0);
    });
  });
});
