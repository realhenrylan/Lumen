/**
 * 光线追踪算法 - 性能优化版本（无墙壁反射）
 * 
 * 优化策略：
 * 1. 减少对象创建（使用临时变量替代临时Point对象）
 * 2. 添加早退条件
 * 3. 优化循环效率
 * 4. 简化目标检测逻辑
 * 5. 取消墙壁反射，光线遇到墙壁停止
 */

import type { Level, Point, RaycastResult } from './types';
import { directionFromAngle, EPS } from './math';
import { findClosestMirrorHit, findClosestObstacleHit, findClosestWallHit } from './collision';

const MAX_BOUNCES = 12;
const MAX_RAY_DIST = 4000;
const MIN_BOUNCE_OFFSET = 1.0;
const MIN_HIT_DISTANCE = 0.5;
const CANVAS_WIDTH = 2560;
const CANVAS_HEIGHT = 1440;

/** 预分配的临时向量（避免重复创建对象） */
const tempOrigin: Point = { x: 0, y: 0 };
const tempDir: Point = { x: 0, y: 0 };
const tempReflected: Point = { x: 0, y: 0 };

export function raycastLevel(level: Level): RaycastResult {
  const segments: RaycastResult['segments'] = [];
  const hitTargetIds: string[] = [];
  
  tempOrigin.x = level.emitter.x;
  tempOrigin.y = level.emitter.y;
  
  const emitterDir = directionFromAngle(level.emitter.angle);
  tempDir.x = emitterDir.x;
  tempDir.y = emitterDir.y;
  
  let lastHitMirrorId: string | null = null;
  const mirrors = level.mirrors;
  const obstacles = level.obstacles;
  const targets = level.targets;
  
  for (let bounce = 0; bounce <= MAX_BOUNCES; bounce += 1) {
    const mirrorHit = findClosestMirrorHit(tempOrigin, tempDir, mirrors);
    const obstacleHit = findClosestObstacleHit(tempOrigin, tempDir, obstacles);
    const wallHit = findClosestWallHit(tempOrigin, tempDir, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 如果什么都没有碰到，光线射向最远距离
    if (!mirrorHit && !obstacleHit && !wallHit) {
      segments.push({
        from: { x: tempOrigin.x, y: tempOrigin.y },
        to: {
          x: tempOrigin.x + tempDir.x * MAX_RAY_DIST,
          y: tempOrigin.y + tempDir.y * MAX_RAY_DIST
        }
      });
      markTargetsOnSegmentFast(targets, tempOrigin, tempDir, hitTargetIds, MAX_RAY_DIST);
      break;
    }

    // 找到最近的碰撞
    let nearest = mirrorHit;
    if (!nearest || (obstacleHit && obstacleHit.distance < nearest.distance)) {
      nearest = obstacleHit;
    }
    // 注意：墙壁碰撞不参与最近碰撞的计算，除非没有镜子或障碍物
    if (!nearest) {
      nearest = wallHit;
    }

    if (!nearest) break;

    // 防止同一镜子重复碰撞
    if (nearest.distance < MIN_HIT_DISTANCE && nearest.mirror?.id === lastHitMirrorId) {
      break;
    }

    const hitPoint = nearest.point;
    const hitX = hitPoint.x;
    const hitY = hitPoint.y;

    // 绘制线段
    segments.push({
      from: { x: tempOrigin.x, y: tempOrigin.y },
      to: { x: hitX, y: hitY }
    });

    // 检查目标碰撞
    markTargetsOnSegmentFast(targets, tempOrigin, tempDir, hitTargetIds, nearest.distance);

    // 如果碰到障碍物或墙壁，光线停止
    if (nearest.obstacle || nearest === wallHit) {
      break;
    }

    // 如果碰到镜子，计算反射
    if (nearest.mirror) {
      const mirrorAngle = nearest.mirror.angle;
      const angleRad = (mirrorAngle * Math.PI) / 180;
      
      // 优化的反射计算
      const dot = tempDir.x * Math.cos(angleRad) + tempDir.y * Math.sin(angleRad);
      tempReflected.x = tempDir.x - 2 * dot * Math.cos(angleRad);
      tempReflected.y = tempDir.y - 2 * dot * Math.sin(angleRad);
      
      // 归一化
      const len = Math.sqrt(tempReflected.x * tempReflected.x + tempReflected.y * tempReflected.y);
      if (len > EPS) {
        tempReflected.x /= len;
        tempReflected.y /= len;
      }

      const offsetDist = Math.max(MIN_BOUNCE_OFFSET, nearest.distance * 0.01);
      tempOrigin.x = hitX + tempReflected.x * offsetDist;
      tempOrigin.y = hitY + tempReflected.y * offsetDist;
      
      tempDir.x = tempReflected.x;
      tempDir.y = tempReflected.y;
      lastHitMirrorId = nearest.mirror.id;
    }
  }

  return { segments, hitTargetIds };
}

/**
 * 快速标记目标（优化版本）
 * 返回是否有目标被击中
 */
function markTargetsOnSegmentFast(
  targets: Level['targets'],
  origin: Point,
  dir: Point,
  hitSet: string[],
  maxDist: number
): boolean {
  let hasHit = false;
  
  for (const target of targets) {
    // 早退：如果目标太远则跳过
    const dx = target.x - origin.x;
    const dy = target.y - origin.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // 如果目标距离小于当前距离且在光线方向上
    if (dist > maxDist) continue;
    
    // 检查点是否在光线的正确方向上
    const t = (dx * dir.x + dy * dir.y) / (dir.x * dir.x + dir.y * dir.y);
    if (t < 0) continue;
    
    // 计算投影点
    const projX = origin.x + t * dir.x;
    const projY = origin.y + t * dir.y;
    
    // 计算距离
    const distToTarget = Math.sqrt((target.x - projX) ** 2 + (target.y - projY) ** 2);
    
    if (distToTarget <= target.r) {
      hitSet.push(target.id);
      hasHit = true;
    }
  }
  
  return hasHit;
}
