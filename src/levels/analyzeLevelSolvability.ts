import { levels } from './index';
import { raycastLevel } from '../game/core/raycast';
import type { Level } from '../game/core/types';
import { mirrorEndpoints } from '../game/core/math';
import { EPS } from '../game/core/math';

interface MirrorAnalysis {
  mirrorId: string;
  reachable: boolean;
  distance: number;
  hitPoint?: { x: number; y: number };
}

interface TargetAnalysis {
  targetId: string;
  reachable: boolean;
  viaMirror?: string;
}

interface LevelSolvability {
  levelId: number;
  solvable: boolean;
  mirrorsAnalysis: MirrorAnalysis[];
  targetsAnalysis: TargetAnalysis[];
  issues: string[];
  suggestions: string[];
}

function checkMirrorReachability(
  level: Level,
  emitterX: number,
  emitterY: number,
  emitterAngle: number
): MirrorAnalysis[] {
  const analysis: MirrorAnalysis[] = [];
  
  const emitterDirX = Math.cos((emitterAngle * Math.PI) / 180);
  const emitterDirY = Math.sin((emitterAngle * Math.PI) / 180);
  
  for (const mirror of level.mirrors) {
    const [start, end] = mirrorEndpoints(mirror.x, mirror.y, mirror.length, mirror.angle);
    
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const segLen = Math.sqrt(dx * dx + dy * dy);
    
    if (segLen < EPS) {
      analysis.push({
        mirrorId: mirror.id,
        reachable: false,
        distance: Infinity,
      });
      continue;
    }
    
    const segDirX = dx / segLen;
    const segDirY = dy / segLen;
    
    const denom = emitterDirX * segDirY - emitterDirY * segDirX;
    
    if (Math.abs(denom) < EPS) {
      const crossProduct = (start.x - emitterX) * emitterDirY - (start.y - emitterY) * emitterDirX;
      if (Math.abs(crossProduct) < EPS) {
        const t = ((start.x - emitterX) * segDirX + (start.y - emitterY) * segDirY) / segLen;
        if (t >= 0 && t <= 1) {
          analysis.push({
            mirrorId: mirror.id,
            reachable: true,
            distance: Math.sqrt(Math.pow(start.x - emitterX, 2) + Math.pow(start.y - emitterY, 2)),
            hitPoint: { x: start.x, y: start.y },
          });
          continue;
        }
      }
      analysis.push({
        mirrorId: mirror.id,
        reachable: false,
        distance: Infinity,
      });
      continue;
    }
    
    const t = ((start.y - emitterY) * segDirX - (start.x - emitterX) * segDirY) / denom;
    const u = ((start.y - emitterY) * emitterDirX - (start.x - emitterX) * emitterDirY) / denom;
    
    if (t > EPS && u >= 0 && u <= 1) {
      const hitX = emitterX + t * emitterDirX;
      const hitY = emitterY + t * emitterDirY;
      analysis.push({
        mirrorId: mirror.id,
        reachable: true,
        distance: t,
        hitPoint: { x: hitX, y: hitY },
      });
    } else {
      analysis.push({
        mirrorId: mirror.id,
        reachable: false,
        distance: Infinity,
      });
    }
  }
  
  return analysis;
}

export function analyzeLevelSolvability(level: Level): LevelSolvability {
  const mirrorsAnalysis = checkMirrorReachability(
    level,
    level.emitter.x,
    level.emitter.y,
    level.emitter.angle
  );
  
  const rayResult = raycastLevel(level);
  
  const targetsAnalysis: TargetAnalysis[] = level.targets.map(target => ({
    targetId: target.id,
    reachable: rayResult.hitTargetIds.includes(target.id),
  }));
  
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  const unreachableMirrors = mirrorsAnalysis.filter(m => !m.reachable);
  if (unreachableMirrors.length > 0) {
    issues.push(`镜子 ${unreachableMirrors.map(m => m.mirrorId).join(', ')} 无法被光线击中`);
    unreachableMirrors.forEach(m => {
      const mirror = level.mirrors.find(mirror => mirror.id === m.mirrorId);
      if (mirror) {
        suggestions.push(`将镜子 ${m.mirrorId} 移动到光线可到达的位置`);
      }
    });
  }
  
  const unreachableTargets = targetsAnalysis.filter(t => !t.reachable);
  if (unreachableTargets.length > 0) {
    issues.push(`目标 ${unreachableTargets.map(t => t.targetId).join(', ')} 无法被击中`);
    if (mirrorsAnalysis.some(m => m.reachable)) {
      suggestions.push('调整镜子角度使光线反射到目标');
    }
  }
  
  return {
    levelId: level.id,
    solvable: unreachableMirrors.length === 0 && unreachableTargets.length === 0,
    mirrorsAnalysis,
    targetsAnalysis,
    issues,
    suggestions,
  };
}

export function verifyLevelCompleteness(level: Level) {
  const analysis = analyzeLevelSolvability(level);
  
  return {
    mirrorsAnalysis: analysis.mirrorsAnalysis.map(m => ({
      id: m.mirrorId,
      reachable: m.reachable ? '✓ 可到达' : '✗ 不可到达',
      distance: m.distance.toFixed(1),
      hitPoint: m.hitPoint ? `(${m.hitPoint.x.toFixed(1)}, ${m.hitPoint.y.toFixed(1)})` : '无',
    })),
    targetsAnalysis: analysis.targetsAnalysis.map(t => ({
      id: t.targetId,
      status: t.reachable ? '✓ 可击中' : '✗ 无法击中',
    })),
    obstaclesAnalysis: level.obstacles.map(o => ({
      id: o.id,
      bounds: `(${o.x}, ${o.y}) ${o.w}x${o.h}`,
    })),
    issues: analysis.issues,
    suggestions: analysis.suggestions,
  };
}

if (typeof window === 'undefined') {
  console.log('=== 关卡可解性分析 ===\n');
  
  levels.forEach(level => {
    const analysis = analyzeLevelSolvability(level);
    console.log(`\n关卡 ${level.id}:`);
    console.log(`可解性: ${analysis.solvable ? '✓' : '✗'}`);
    
    analysis.mirrorsAnalysis.forEach(m => {
      console.log(`  镜子 ${m.mirrorId}: ${m.reachable ? '✓ 可到达' : '✗ 不可到达'} (距离: ${m.distance.toFixed(1)})`);
    });
    
    analysis.targetsAnalysis.forEach(t => {
      console.log(`  目标 ${t.targetId}: ${t.reachable ? '✓ 可击中' : '✗ 无法击中'}`);
    });
    
    if (analysis.issues.length > 0) {
      console.log('  问题:');
      analysis.issues.forEach(issue => console.log(`    - ${issue}`));
    }
    
    if (analysis.suggestions.length > 0) {
      console.log('  建议:');
      analysis.suggestions.forEach(suggestion => console.log(`    - ${suggestion}`));
    }
  });
  
  const allSolvable = levels.every(level => analyzeLevelSolvability(level).solvable);
  console.log(`\n${allSolvable ? '✅ 所有关卡都可解!' : '❌ 有些关卡不可解'}`);
}
