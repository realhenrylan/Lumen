import { describe, it, expect } from 'vitest';
import { raycastLevel } from './raycast';
import type { Level } from './types';

describe('Raycast', () => {
  describe('Basic Reflection', () => {
    it('handles single mirror reflection', () => {
      const level: Level = {
        id: 1,
        emitter: { x: 50, y: 100, angle: 0 },
        mirrors: [{
          id: 'm1',
          x: 200,
          y: 100,
          length: 100,
          angle: 45,
          rotatable: true,
        }],
        targets: [{
          id: 't1',
          x: 300,
          y: 200,
          r: 15,
        }],
        obstacles: [],
      };

      const result = raycastLevel(level);
      
      expect(result.segments.length).toBeGreaterThanOrEqual(2);
      expect(result.segments[0].from.x).toBeCloseTo(50);
      expect(result.segments[0].from.y).toBeCloseTo(100);
    });

    it('detects direct target hit without reflection', () => {
      const level: Level = {
        id: 1,
        emitter: { x: 50, y: 100, angle: 0 },
        mirrors: [],
        targets: [{
          id: 't1',
          x: 200,
          y: 100,
          r: 20,
        }],
        obstacles: [],
      };

      const result = raycastLevel(level);
      
      expect(result.hitTargetIds).toContain('t1');
    });

    it('does not detect miss', () => {
      const level: Level = {
        id: 1,
        emitter: { x: 50, y: 100, angle: 0 },
        mirrors: [{
          id: 'm1',
          x: 200,
          y: 100,
          length: 100,
          angle: 0,
          rotatable: true,
        }],
        targets: [{
          id: 't1',
          x: 500,
          y: 500,
          r: 10,
        }],
        obstacles: [],
      };

      const result = raycastLevel(level);
      
      expect(result.hitTargetIds).not.toContain('t1');
    });
  });

  describe('Multiple Reflections', () => {
    it('handles multiple mirrors in scene', () => {
      const level: Level = {
        id: 2,
        emitter: { x: 50, y: 270, angle: 0 },
        mirrors: [
          {
            id: 'm1',
            x: 270,
            y: 210,
            length: 100,
            angle: 30,
            rotatable: true,
          },
          {
            id: 'm2',
            x: 520,
            y: 290,
            length: 130,
            angle: -35,
            rotatable: true,
          },
        ],
        targets: [{
          id: 't1',
          x: 790,
          y: 210,
          r: 14,
        }],
        obstacles: [],
      };

      const result = raycastLevel(level);
      
      expect(result.segments.length).toBeGreaterThanOrEqual(2);
    });

    it('respects max bounces limit', () => {
      const level: Level = {
        id: 1,
        emitter: { x: 50, y: 270, angle: 0 },
        mirrors: [{
          id: 'm1',
          x: 200,
          y: 270,
          length: 300,
          angle: 45,
          rotatable: true,
        }],
        targets: [],
        obstacles: [],
      };

      const result = raycastLevel(level);
      
      expect(result.segments.length).toBeLessThanOrEqual(13);
    });
  });

  describe('Obstacles', () => {
    it('stops ray at obstacle', () => {
      const level: Level = {
        id: 1,
        emitter: { x: 50, y: 270, angle: 0 },
        mirrors: [{
          id: 'm1',
          x: 400,
          y: 270,
          length: 100,
          angle: 0,
          rotatable: true,
        }],
        targets: [{
          id: 't1',
          x: 600,
          y: 270,
          r: 20,
        }],
        obstacles: [{
          id: 'o1',
          x: 300,
          y: 200,
          w: 80,
          h: 140,
        }],
      };

      const result = raycastLevel(level);
      
      const lastSegment = result.segments[result.segments.length - 1];
      expect(lastSegment.to.x).toBeLessThanOrEqual(380);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty level', () => {
      const level: Level = {
        id: 1,
        emitter: { x: 50, y: 270, angle: 0 },
        mirrors: [],
        targets: [],
        obstacles: [],
      };

      const result = raycastLevel(level);
      
      expect(result.segments.length).toBeGreaterThanOrEqual(1);
      expect(result.hitTargetIds.length).toBe(0);
    });

    it('handles multiple targets', () => {
      const level: Level = {
        id: 1,
        emitter: { x: 50, y: 270, angle: 0 },
        mirrors: [{
          id: 'm1',
          x: 200,
          y: 270,
          length: 100,
          angle: 45,
          rotatable: true,
        }],
        targets: [
          { id: 't1', x: 100, y: 270, r: 10 },
          { id: 't2', x: 200, y: 170, r: 10 },
        ],
        obstacles: [],
      };

      const result = raycastLevel(level);
      
      expect(result.hitTargetIds).toContain('t1');
      expect(result.hitTargetIds).toContain('t2');
    });
  });
});
