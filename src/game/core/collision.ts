import type { Mirror, Obstacle, Point } from './types';
import { EPS, mirrorEndpoints, sub } from './math';

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
  const r = dir;
  const s = sub(b, a);
  const denom = cross(r, s);
  if (Math.abs(denom) < EPS) return null;

  const ao = sub(a, origin);
  const t = cross(ao, s) / denom;
  const u = cross(ao, r) / denom;

  if (t > EPS && u >= -EPS && u <= 1 + EPS) {
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
