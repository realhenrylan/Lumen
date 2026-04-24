// 完整的关卡可解性分析脚本
const levelsData = require('./src/levels/levels.json');

// 复制游戏中的数学函数
function mirrorEndpoints(x, y, length, angleDeg) {
  const r = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(r) * (length / 2);
  const dy = Math.sin(r) * (length / 2);
  return [
    { x: x - dx, y: y - dy },
    { x: x + dx, y: y + dy },
  ];
}

function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

function directionFromAngle(deg) {
  const r = degToRad(deg);
  return { x: Math.cos(r), y: Math.sin(r) };
}

function normalize(v) {
  const len = Math.hypot(v.x, v.y);
  if (len < 1e-6) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

function dot(a, b) {
  return a.x * b.x + a.y * b.y;
}

function sub(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

function mul(v, s) {
  return { x: v.x * s, y: v.y * s };
}

function cross(a, b) {
  return a.x * b.y - a.y * b.x;
}

function distancePointToSegment(p, a, b) {
  const ab = sub(b, a);
  const ap = sub(p, a);
  const abLen2 = dot(ab, ab);
  if (abLen2 < 1e-6) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = Math.max(0, Math.min(1, dot(ap, ab) / abLen2));
  const proj = add(a, mul(ab, t));
  return Math.hypot(p.x - proj.x, p.y - proj.y);
}

function raySegmentIntersection(origin, dir, a, b) {
  const r = dir;
  const s = sub(b, a);
  const denom = cross(r, s);
  if (Math.abs(denom) < 1e-6) return null;

  const ao = sub(a, origin);
  const t = cross(ao, s) / denom;
  const u = cross(ao, r) / denom;

  const uMin = -1e-6 * 10;
  const uMax = 1 + 1e-6 * 10;

  if (t > 1e-6 && u >= uMin && u <= uMax) {
    return {
      point: { x: origin.x + r.x * t, y: origin.y + r.y * t },
      t,
    };
  }

  return null;
}

function checkRayHitsMirror(emitter, dir, mirror) {
  const [start, end] = mirrorEndpoints(mirror.x, mirror.y, mirror.length, mirror.angle);
  return raySegmentIntersection(
    { x: emitter.x, y: emitter.y },
    dir,
    start,
    end
  );
}

function analyzeLevel(level) {
  const emitter = level.emitter;
  const emitterDir = normalize(directionFromAngle(emitter.angle));
  
  const issues = [];
  const warnings = [];
  
  // 1. 检查发射器方向
  const emitterAngleDeg = Math.round(emitter.angle);
  
  // 2. 检查每个镜子是否在光线路径上
  for (let i = 0; i < level.mirrors.length; i++) {
    const mirror = level.mirrors[i];
    const hit = checkRayHitsMirror(emitter, emitterDir, mirror);
    
    if (!hit) {
      // 检查镜子是否在光束的延长线上（可能是后面的镜子）
      const [start, end] = mirrorEndpoints(mirror.x, mirror.y, mirror.length, mirror.angle);
      const mirrorCenter = { x: mirror.x, y: mirror.y };
      const toMirror = sub(mirrorCenter, { x: emitter.x, y: emitter.y });
      const dist = Math.hypot(toMirror.x, toMirror.y);
      const cosAngle = dot(normalize(toMirror), emitterDir);
      
      if (cosAngle > 0) { // 镜子在发射方向前方
        issues.push(`镜子 ${mirror.id} 在发射器前方但光线碰不到！`);
      }
    }
  }
  
  // 3. 检查目标是否可达（从任一镜子可达）
  for (const target of level.targets) {
    let reachable = false;
    
    // 首先检查直接从发射器能否到达（无需反射）
    const directDist = Math.hypot(target.x - emitter.x, target.y - emitter.y);
    const dirToTarget = normalize({ x: target.x - emitter.x, y: target.y - emitter.y });
    const directAngle = Math.acos(dot(emitterDir, dirToTarget)) * 180 / Math.PI;
    
    if (directAngle < 90) { // 在发射器前方
      // 检查是否有障碍物阻挡
      let blocked = false;
      for (const obs of level.obstacles) {
        const obsHit = raySegmentIntersection(
          { x: emitter.x, y: emitter.y },
          emitterDir,
          { x: obs.x, y: obs.y },
          { x: obs.x + obs.w, y: obs.y + obs.h }
        );
        if (obsHit) {
          const obsDist = Math.hypot(obsHit.point.x - emitter.x, obsHit.point.y - emitter.y);
          if (obsDist < directDist) {
            blocked = true;
            break;
          }
        }
      }
      if (!blocked) {
        reachable = true;
      }
    }
    
    // 检查从每个镜子反射后能否到达
    if (!reachable) {
      for (const mirror of level.mirrors) {
        const hit = checkRayHitsMirror(emitter, emitterDir, mirror);
        if (hit) {
          // 计算反射方向
          const mirrorRad = degToRad(mirror.angle);
          const tangent = { x: Math.cos(mirrorRad), y: Math.sin(mirrorRad) };
          const normal1 = normalize({ x: -tangent.y, y: tangent.x });
          const normal2 = normalize({ x: tangent.y, y: -tangent.x });
          const n = dot(emitterDir, normal1) < 0 ? normal1 : normal2;
          const reflected = normalize(sub(emitterDir, mul(n, 2 * dot(emitterDir, n))));
          
          // 检查反射后能否到达目标
          const toTarget = normalize({ x: target.x - hit.point.x, y: target.y - hit.point.y });
          const reflAngle = Math.acos(dot(reflected, toTarget)) * 180 / Math.PI;
          
          if (reflAngle < 90) {
            reachable = true;
            break;
          }
        }
      }
    }
    
    if (!reachable) {
      issues.push(`目标 ${target.id} 似乎无法从任何镜子反射到达！`);
    }
  }
  
  return {
    levelId: level.id,
    issues,
    warnings,
    emitterAngle: emitterAngleDeg,
    mirrorCount: level.mirrors.length,
    targetCount: level.targets.length,
    obstacleCount: level.obstacles.length
  };
}

console.log('=== 关卡物理可解性分析 ===\n');

const results = levelsData.map(level => analyzeLevel(level));

let hasIssues = false;
results.forEach(result => {
  if (result.issues.length > 0) {
    hasIssues = true;
    console.log(`❌ 关卡 ${result.levelId}:`);
    result.issues.forEach(issue => console.log(`   - ${issue}`));
  } else {
    console.log(`✅ 关卡 ${result.levelId} (镜子:${result.mirrorCount}, 目标:${result.targetCount}, 障碍:${result.obstacleCount})`);
  }
});

if (hasIssues) {
  console.log('\n⚠️  发现物理设计问题，需要修复！');
  process.exit(1);
} else {
  console.log('\n✅ 所有关卡物理设计检查通过！');
  process.exit(0);
}
