import { describe, it, expect } from 'vitest';
import { findClosestMirrorHit, findClosestObstacleHit } from './collision';
import type { Mirror, Obstacle } from './types';

describe('Collision Detection', () => {
  describe('findClosestMirrorHit', () => {
    it('detects diagonal ray hitting horizontal mirror', () => {
      const mirror: Mirror = {
        id: 'm1',
        x: 100,
        y: 100,
        length: 100,
        angle: 0,
        rotatable: true,
      };
      
      const origin = { x: 50, y: 0 };
      const dir = { x: 0, y: 1 };
      const hit = findClosestMirrorHit(origin, dir, [mirror]);
      
      expect(hit).not.toBeNull();
      expect(hit!.point.y).toBeCloseTo(100);
      expect(hit!.mirror?.id).toBe('m1');
    });

    it('detects vertical ray hitting vertical mirror', () => {
      const verticalMirror: Mirror = {
        id: 'm2',
        x: 100,
        y: 100,
        length: 100,
        angle: 90,
        rotatable: true,
      };
      const origin = { x: 0, y: 50 };
      const dir = { x: 1, y: 0 };
      const hit = findClosestMirrorHit(origin, dir, [verticalMirror]);
      
      expect(hit).not.toBeNull();
      expect(hit!.point.x).toBeCloseTo(100);
      expect(hit!.mirror?.id).toBe('m2');
    });

    it('returns null when ray misses mirror', () => {
      const mirror: Mirror = {
        id: 'm1',
        x: 100,
        y: 100,
        length: 100,
        angle: 0,
        rotatable: true,
      };
      const origin = { x: 0, y: 200 };
      const dir = { x: 1, y: 0 };
      const hit = findClosestMirrorHit(origin, dir, [mirror]);
      
      expect(hit).toBeNull();
    });

    it('detects closest of multiple mirrors', () => {
      const mirror1: Mirror = {
        id: 'm1',
        x: 100,
        y: 100,
        length: 100,
        angle: 0,
        rotatable: true,
      };
      const mirror2: Mirror = {
        id: 'm2',
        x: 300,
        y: 100,
        length: 100,
        angle: 0,
        rotatable: true,
      };
      
      const origin = { x: 50, y: 0 };
      const dir = { x: 0, y: 1 };
      const hit = findClosestMirrorHit(origin, dir, [mirror1, mirror2]);
      
      expect(hit!.mirror?.id).toBe('m1');
      expect(hit!.point.y).toBeCloseTo(100);
    });
  });

  describe('findClosestObstacleHit', () => {
    const obstacle: Obstacle = {
      id: 'o1',
      x: 100,
      y: 100,
      w: 50,
      h: 50,
    };

    it('detects ray hitting obstacle', () => {
      const origin = { x: 0, y: 125 };
      const dir = { x: 1, y: 0 };
      const hit = findClosestObstacleHit(origin, dir, [obstacle]);
      
      expect(hit).not.toBeNull();
      expect(hit!.point.x).toBeCloseTo(100);
      expect(hit!.point.y).toBeCloseTo(125);
      expect(hit!.obstacle?.id).toBe('o1');
    });

    it('returns null when ray misses obstacle', () => {
      const origin = { x: 0, y: 0 };
      const dir = { x: 1, y: 0 };
      const hit = findClosestObstacleHit(origin, dir, [obstacle]);
      
      expect(hit).toBeNull();
    });

    it('detects closest of multiple obstacles', () => {
      const obstacle2: Obstacle = {
        id: 'o2',
        x: 200,
        y: 100,
        w: 50,
        h: 50,
      };
      
      const origin = { x: 0, y: 125 };
      const dir = { x: 1, y: 0 };
      const hit = findClosestObstacleHit(origin, dir, [obstacle, obstacle2]);
      
      expect(hit!.obstacle?.id).toBe('o1');
    });
  });

  describe('Edge Cases', () => {
    it('handles zero-length mirror gracefully', () => {
      const mirror: Mirror = {
        id: 'm1',
        x: 100,
        y: 100,
        length: 0,
        angle: 0,
        rotatable: true,
      };
      
      const origin = { x: 0, y: 100 };
      const dir = { x: 1, y: 0 };
      const hit = findClosestMirrorHit(origin, dir, [mirror]);
      
      expect(hit).toBeNull();
    });

    it('handles ray parallel to obstacle edge', () => {
      const obstacle: Obstacle = {
        id: 'o1',
        x: 100,
        y: 100,
        w: 50,
        h: 50,
      };
      
      const origin = { x: 0, y: 100 };
      const dir = { x: 0, y: 1 };
      const hit = findClosestObstacleHit(origin, dir, [obstacle]);
      
      expect(hit).toBeNull();
    });
  });
});
