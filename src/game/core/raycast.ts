import type { Level, Point, RaycastResult } from './types';
import { add, directionFromAngle, distancePointToSegment, mul, normalize, reflect, EPS } from './math';
import { findClosestMirrorHit, findClosestObstacleHit, findClosestWallHit } from './collision';

const MAX_BOUNCES = 12;
const MAX_RAY_DIST = 2000;
const MIN_BOUNCE_OFFSET = 1.0;
const MIN_HIT_DISTANCE = 0.5;
const CANVAS_WIDTH = 1400;
const CANVAS_HEIGHT = 800;

export function raycastLevel(level: Level): RaycastResult {
  const segments: RaycastResult['segments'] = [];
  const hitTargetIds = new Set<string>();

  let origin: Point = { x: level.emitter.x, y: level.emitter.y };
  let dir = normalize(directionFromAngle(level.emitter.angle));
  let lastHitMirrorId: string | null = null;

  for (let bounce = 0; bounce <= MAX_BOUNCES; bounce += 1) {
    const mirrorHit = findClosestMirrorHit(origin, dir, level.mirrors);
    const obstacleHit = findClosestObstacleHit(origin, dir, level.obstacles);
    const wallHit = findClosestWallHit(origin, dir, CANVAS_WIDTH, CANVAS_HEIGHT);

    const fallbackEnd = add(origin, mul(dir, MAX_RAY_DIST));

    if (!mirrorHit && !obstacleHit && !wallHit) {
      segments.push({ from: origin, to: fallbackEnd });
      markTargetsOnSegment(level, origin, fallbackEnd, hitTargetIds);
      break;
    }

    let nearest = mirrorHit || obstacleHit || wallHit;
    if (mirrorHit && (!nearest || mirrorHit.distance < nearest.distance)) {
      nearest = mirrorHit;
    }
    if (obstacleHit && (!nearest || obstacleHit.distance < nearest.distance)) {
      nearest = obstacleHit;
    }
    if (wallHit && (!nearest || wallHit.distance < nearest.distance)) {
      nearest = wallHit;
    }

    if (!nearest) break;

    if (nearest.distance < MIN_HIT_DISTANCE && nearest.mirror?.id === lastHitMirrorId) {
      break;
    }

    segments.push({ from: origin, to: nearest.point });
    markTargetsOnSegment(level, origin, nearest.point, hitTargetIds);

    if (nearest.obstacle) {
      break;
    }

    if (nearest.mirror) {
      const reflected = reflect(dir, nearest.mirror.angle);
      const offset = Math.max(MIN_BOUNCE_OFFSET, nearest.distance * 0.01);
      origin = add(nearest.point, mul(reflected, offset));
      dir = reflected;
      lastHitMirrorId = nearest.mirror.id;
    } else if (nearest === wallHit) {
      const wallNormal = calculateWallNormal(nearest.point, dir);
      dir = reflect(dir, Math.atan2(wallNormal.y, wallNormal.x));
      origin = add(nearest.point, mul(dir, MIN_BOUNCE_OFFSET));
    }
  }

  return { segments, hitTargetIds: [...hitTargetIds] };
}

function calculateWallNormal(hitPoint: Point, dir: Point): Point {
  if (hitPoint.y < EPS) return { x: 0, y: -1 };
  if (hitPoint.y > CANVAS_HEIGHT - EPS) return { x: 0, y: 1 };
  if (hitPoint.x < EPS) return { x: 1, y: 0 };
  return { x: -1, y: 0 };
}

function markTargetsOnSegment(level: Level, a: Point, b: Point, hitSet: Set<string>) {
  for (const target of level.targets) {
    const d = distancePointToSegment({ x: target.x, y: target.y }, a, b);
    if (d <= target.r) {
      hitSet.add(target.id);
    }
  }
}
