import { describe, it, expect } from 'vitest';
import {
  degToRad,
  radToDeg,
  normalize,
  dot,
  sub,
  add,
  mul,
  directionFromAngle,
  reflect,
  distancePointToSegment,
  mirrorEndpoints,
  EPS,
} from './math';

describe('Math Utils', () => {
  describe('degToRad / radToDeg', () => {
    it('converts 0 degrees to radians', () => {
      expect(degToRad(0)).toBe(0);
    });

    it('converts 180 degrees to PI', () => {
      expect(degToRad(180)).toBeCloseTo(Math.PI);
    });

    it('roundtrip conversion', () => {
      const deg = 45;
      expect(radToDeg(degToRad(deg))).toBeCloseTo(deg);
    });
  });

  describe('normalize', () => {
    it('normalizes unit vector', () => {
      const v = normalize({ x: 1, y: 0 });
      expect(v.x).toBeCloseTo(1);
      expect(v.y).toBeCloseTo(0);
    });

    it('normalizes diagonal vector', () => {
      const v = normalize({ x: 1, y: 1 });
      expect(v.x).toBeCloseTo(Math.SQRT2 / 2);
      expect(v.y).toBeCloseTo(Math.SQRT2 / 2);
    });

    it('handles zero vector', () => {
      const v = normalize({ x: 0, y: 0 });
      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
    });
  });

  describe('dot product', () => {
    it('calculates perpendicular vectors', () => {
      expect(dot({ x: 1, y: 0 }, { x: 0, y: 1 })).toBeCloseTo(0);
    });

    it('calculates parallel vectors', () => {
      expect(dot({ x: 1, y: 0 }, { x: 2, y: 0 })).toBeCloseTo(2);
    });
  });

  describe('sub / add', () => {
    it('subtracts vectors', () => {
      const result = sub({ x: 5, y: 5 }, { x: 2, y: 3 });
      expect(result.x).toBeCloseTo(3);
      expect(result.y).toBeCloseTo(2);
    });

    it('adds vectors', () => {
      const result = add({ x: 2, y: 3 }, { x: 3, y: 2 });
      expect(result.x).toBeCloseTo(5);
      expect(result.y).toBeCloseTo(5);
    });
  });

  describe('mul', () => {
    it('multiplies vector by scalar', () => {
      const result = mul({ x: 2, y: 3 }, 2);
      expect(result.x).toBeCloseTo(4);
      expect(result.y).toBeCloseTo(6);
    });
  });

  describe('directionFromAngle', () => {
    it('returns correct direction for 0 degrees', () => {
      const dir = directionFromAngle(0);
      expect(dir.x).toBeCloseTo(1);
      expect(dir.y).toBeCloseTo(0);
    });

    it('returns correct direction for 90 degrees', () => {
      const dir = directionFromAngle(90);
      expect(dir.x).toBeCloseTo(0);
      expect(dir.y).toBeCloseTo(1);
    });

    it('returns correct direction for 45 degrees', () => {
      const dir = directionFromAngle(45);
      expect(dir.x).toBeCloseTo(Math.SQRT2 / 2);
      expect(dir.y).toBeCloseTo(Math.SQRT2 / 2);
    });
  });

  describe('reflect', () => {
    it('reflects ray correctly off 45 degree mirror', () => {
      const inDir = { x: 0, y: -1 };
      const reflected = reflect(inDir, 45);
      const result = Math.hypot(reflected.x, reflected.y);
      expect(result).toBeCloseTo(1, 5);
    });

    it('reflects vertical ray off horizontal mirror (0 deg)', () => {
      const inDir = { x: 0, y: -1 };
      const reflected = reflect(inDir, 0);
      const result = Math.hypot(reflected.x, reflected.y);
      expect(result).toBeCloseTo(1, 5);
      expect(Math.abs(reflected.x)).toBeLessThan(0.1);
    });

    it('maintains vector magnitude after reflection', () => {
      const inDir = directionFromAngle(60);
      const mirrorAngle = 45;
      const reflected = reflect(inDir, mirrorAngle);
      expect(Math.hypot(reflected.x, reflected.y)).toBeCloseTo(1, 5);
    });
  });

  describe('distancePointToSegment', () => {
    it('returns 0 for point on segment', () => {
      const d = distancePointToSegment({ x: 1, y: 0 }, { x: 0, y: 0 }, { x: 2, y: 0 });
      expect(d).toBeLessThan(EPS);
    });

    it('returns perpendicular distance', () => {
      const d = distancePointToSegment({ x: 1, y: 1 }, { x: 0, y: 0 }, { x: 2, y: 0 });
      expect(d).toBeCloseTo(1);
    });

    it('returns distance to nearest endpoint', () => {
      const d = distancePointToSegment({ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 2, y: 0 });
      expect(d).toBeCloseTo(1);
    });
  });

  describe('mirrorEndpoints', () => {
    it('calculates endpoints for horizontal mirror', () => {
      const [a, b] = mirrorEndpoints(0, 0, 10, 0);
      expect(a.x).toBeCloseTo(-5);
      expect(a.y).toBeCloseTo(0);
      expect(b.x).toBeCloseTo(5);
      expect(b.y).toBeCloseTo(0);
    });

    it('calculates endpoints for vertical mirror', () => {
      const [a, b] = mirrorEndpoints(0, 0, 10, 90);
      expect(a.x).toBeCloseTo(0);
      expect(a.y).toBeCloseTo(-5);
      expect(b.x).toBeCloseTo(0);
      expect(b.y).toBeCloseTo(5);
    });

    it('calculates endpoints for 45 degree mirror', () => {
      const [a, b] = mirrorEndpoints(0, 0, 10 * Math.SQRT2, 45);
      expect(a.x).toBeCloseTo(-5, 5);
      expect(a.y).toBeCloseTo(-5, 5);
      expect(b.x).toBeCloseTo(5, 5);
      expect(b.y).toBeCloseTo(5, 5);
    });
  });
});
