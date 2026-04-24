import type { Point } from './types';

export const EPS = 1e-6;

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function normalize(v: Point): Point {
  const len = Math.hypot(v.x, v.y);
  if (len < EPS) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

export function dot(a: Point, b: Point): number {
  return a.x * b.x + a.y * b.y;
}

export function sub(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function add(a: Point, b: Point): Point {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function mul(v: Point, s: number): Point {
  return { x: v.x * s, y: v.y * s };
}

export function directionFromAngle(deg: number): Point {
  const r = degToRad(deg);
  return { x: Math.cos(r), y: Math.sin(r) };
}

export function reflect(inDir: Point, mirrorAngleDeg: number): Point {
  const mirrorRad = degToRad(mirrorAngleDeg);
  const tangent = { x: Math.cos(mirrorRad), y: Math.sin(mirrorRad) };
  const normal1 = normalize({ x: -tangent.y, y: tangent.x });
  const normal2 = normalize({ x: tangent.y, y: -tangent.x });
  const d = normalize(inDir);
  const n = dot(d, normal1) < 0 ? normal1 : normal2;
  const reflected = sub(d, mul(n, 2 * dot(d, n)));
  return normalize(reflected);
}

export function distancePointToSegment(p: Point, a: Point, b: Point): number {
  const ab = sub(b, a);
  const ap = sub(p, a);
  const abLen2 = dot(ab, ab);
  if (abLen2 < EPS) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = Math.max(0, Math.min(1, dot(ap, ab) / abLen2));
  const proj = add(a, mul(ab, t));
  return Math.hypot(p.x - proj.x, p.y - proj.y);
}

export function isPointInSegment(p: Point, a: Point, b: Point): boolean {
  const d = distancePointToSegment(p, a, b);
  return d < EPS;
}

export function distanceBetweenPoints(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function mirrorEndpoints(x: number, y: number, length: number, angleDeg: number): [Point, Point] {
  const r = degToRad(angleDeg);
  const dx = Math.cos(r) * (length / 2);
  const dy = Math.sin(r) * (length / 2);
  return [
    { x: x - dx, y: y - dy },
    { x: x + dx, y: y + dy },
  ];
}
