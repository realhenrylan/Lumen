import type { Mirror, Obstacle, Point } from './types';
import { EPS, mirrorEndpoints, sub, dot, normalize } from './math';

export type RayHit = {
  point: Point;
  distance: number;
  mirror?: Mirror;
  obstacle?: Obstacle;
};

function cross(a: Point, b: Point): number {
  return a.x * b.y - a.y * b.x;
}

function raySegmentIntersection(origin: Point, dir: Point, a: Point, b: Point): { point: Point; t: number } | null {
  const r = normalize(dir);
  const s = sub(b, a);
  const denom = cross(r, s);
  
  const ao = sub(a, origin);
  
  if (Math.abs(denom) < EPS) {
    if (Math.abs(cross(ao, r)) < EPS) {
      const sLen2 = dot(s, s);
      if (sLen2 < EPS) return null;
      
      if (Math.abs(r.x) > Math.abs(r.y)) {
        const t = (a.x - origin.x) / r.x;
        if (t >= 0 && a.x >= Math.min(origin.x, origin.x + r.x * t) && a.x <= Math.max(origin.x, origin.x + r.x * t)) {
          return {
            point: { x: a.x, y: origin.y + r.y * t },
            t: Math.abs(t),
          };
        }
      } else if (Math.abs(r.y) > EPS) {
        const t = (a.y - origin.y) / r.y;
        if (t >= 0 && a.y >= Math.min(origin.y, origin.y + r.y * t) && a.y <= Math.max(origin.y, origin.y + r.y * t)) {
          return {
            point: { x: origin.x + r.x * t, y: a.y },
            t: Math.abs(t),
          };
        }
      }
      
      return null;
    }
    return null;
  }

  const t = cross(ao, s) / denom;
  const u = cross(ao, r) / denom;

  const uMin = -EPS * 10;
  const uMax = 1 + EPS * 10;
  
  if (t > EPS && u >= uMin && u <= uMax) {
    return {
      point: { x: origin.x + r.x * t, y: origin.y + r.y * t },
      t,
    };
  }

  return null;
}

export function findClosestMirrorHit(origin: Point, dir: Point, mirrors: Mirror[]): RayHit | null {
  let closest: RayHit | null = null;

  for (const mirror of mirrors) {
    const [a, b] = mirrorEndpoints(mirror.x, mirror.y, mirror.length, mirror.angle);
    const hit = raySegmentIntersection(origin, dir, a, b);
    if (!hit) continue;
    if (!closest || hit.t < closest.distance) {
      closest = { point: hit.point, distance: hit.t, mirror };
    }
  }

  return closest;
}

function rectEdges(o: Obstacle): Array<[Point, Point]> {
  const p1 = { x: o.x, y: o.y };
  const p2 = { x: o.x + o.w, y: o.y };
  const p3 = { x: o.x + o.w, y: o.y + o.h };
  const p4 = { x: o.x, y: o.y + o.h };
  return [
    [p1, p2],
    [p2, p3],
    [p3, p4],
    [p4, p1],
  ];
}

export function findClosestObstacleHit(origin: Point, dir: Point, obstacles: Obstacle[]): RayHit | null {
  let closest: RayHit | null = null;

  for (const obstacle of obstacles) {
    for (const [a, b] of rectEdges(obstacle)) {
      const hit = raySegmentIntersection(origin, dir, a, b);
      if (!hit) continue;
      if (!closest || hit.t < closest.distance) {
        closest = { point: hit.point, distance: hit.t, obstacle };
      }
    }
  }

  return closest;
}

export function findClosestWallHit(
  origin: Point,
  dir: Point,
  canvasWidth: number,
  canvasHeight: number
): RayHit | null {
  const walls: Array<[Point, Point]> = [
    [{ x: 0, y: 0 }, { x: canvasWidth, y: 0 }],
    [{ x: canvasWidth, y: 0 }, { x: canvasWidth, y: canvasHeight }],
    [{ x: canvasWidth, y: canvasHeight }, { x: 0, y: canvasHeight }],
    [{ x: 0, y: canvasHeight }, { x: 0, y: 0 }],
  ];

  let closest: RayHit | null = null;

  for (const [a, b] of walls) {
    const hit = raySegmentIntersection(origin, dir, a, b);
    if (!hit) continue;
    if (!closest || hit.t < closest.distance) {
      closest = { point: hit.point, distance: hit.t };
    }
  }

  return closest;
}
