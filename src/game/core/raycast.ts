import type { Level, Point, RaycastResult } from './types';
import { add, directionFromAngle, distancePointToSegment, mul, normalize, reflect } from './math';
import { findClosestMirrorHit, findClosestObstacleHit } from './collision';

const MAX_BOUNCES = 12;
const MAX_RAY_DIST = 2000;

export function raycastLevel(level: Level): RaycastResult {
  const segments: RaycastResult['segments'] = [];
  const hitTargetIds = new Set<string>();

  let origin: Point = { x: level.emitter.x, y: level.emitter.y };
  let dir = normalize(directionFromAngle(level.emitter.angle));

  for (let bounce = 0; bounce <= MAX_BOUNCES; bounce += 1) {
    const mirrorHit = findClosestMirrorHit(origin, dir, level.mirrors);
    const obstacleHit = findClosestObstacleHit(origin, dir, level.obstacles);

    const fallbackEnd = add(origin, mul(dir, MAX_RAY_DIST));

    if (!mirrorHit && !obstacleHit) {
      segments.push({ from: origin, to: fallbackEnd });
      markTargetsOnSegment(level, origin, fallbackEnd, hitTargetIds);
      break;
    }

    const nearest = !mirrorHit
      ? obstacleHit
      : !obstacleHit
        ? mirrorHit
        : mirrorHit.distance < obstacleHit.distance
          ? mirrorHit
          : obstacleHit;

    if (!nearest) break;

    segments.push({ from: origin, to: nearest.point });
    markTargetsOnSegment(level, origin, nearest.point, hitTargetIds);

    if (nearest.obstacle) {
      break;
    }

    if (nearest.mirror) {
      dir = reflect(dir, nearest.mirror.angle);
      origin = add(nearest.point, mul(dir, 0.2));
    }
  }

  return { segments, hitTargetIds: [...hitTargetIds] };
}

function markTargetsOnSegment(level: Level, a: Point, b: Point, hitSet: Set<string>) {
  for (const target of level.targets) {
    const d = distancePointToSegment({ x: target.x, y: target.y }, a, b);
    if (d <= target.r) {
      hitSet.add(target.id);
    }
  }
}
