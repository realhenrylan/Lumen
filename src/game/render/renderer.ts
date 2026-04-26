import type { GameRenderState } from '../engine/stateTypes';
import type { Mirror, Level, Point, RaycastResult } from '../core/types';
import { mirrorEndpoints } from '../core/math';

/** 极简配色方案 - 深色极简风格 */
const COLORS = {
  background: '#0D1117',
  obstacle: '#21262D',
  targetStroke: '#30363D',
  targetFill: 'rgba(48, 54, 61, 0.3)',
  targetHit: '#7EE787',
  targetHitFill: 'rgba(126, 231, 135, 0.4)',
  mirrorRotatable: 'rgba(255, 255, 255, 0.6)',
  mirrorActive: 'rgba(255, 255, 255, 0.8)',
  mirrorFixed45: 'rgba(121, 192, 255, 0.6)',
  mirrorFixed135: 'rgba(163, 113, 247, 0.6)',
  beam: '#FFFFFF',
  beamGlow: 'rgba(255, 255, 255, 0.3)',
  emitter: '#FFFFFF',
  emitterRing: 'rgba(88, 166, 255, 0.8)',
  hintMirror: 'rgba(88, 166, 255, 0.5)',
  clearText: '#FFFFFF',
  clearSubtitle: '#8B949E',
  mirrorStroke: 'rgba(255,255,255,0.3)',
  hintArrowFill: 'rgba(88, 166, 255, 0.8)',
};

type MirrorEndpointCache = {
  current: [Point, Point];
  hint?: [Point, Point];
  currentAngle: number;
  hintAngle?: number;
};

const cache = {
  mirrorEndpoints: new Map<string, MirrorEndpointCache>(),
  lastRenderTime: 0,
};

function getMirrorColor(mirror: Mirror, isActive: boolean): string {
  if (isActive) return COLORS.mirrorActive;
  if (!mirror.rotatable) {
    return mirror.angle === 45 ? COLORS.mirrorFixed45 : COLORS.mirrorFixed135;
  }
  return COLORS.mirrorRotatable;
}

function precomputeMirrorEndpoints(
  level: Level,
  hintAngles?: Array<{ id: string; angle: number }>
) {
  const now = performance.now();
  
  for (const mirror of level.mirrors) {
    const [a, b] = mirrorEndpoints(mirror.x, mirror.y, mirror.length, mirror.angle);
    const cached = cache.mirrorEndpoints.get(mirror.id);
    
    if (!cached || cached.currentAngle !== mirror.angle) {
      cache.mirrorEndpoints.set(mirror.id, {
        current: [a, b],
        currentAngle: mirror.angle,
        hint: undefined,
        hintAngle: undefined,
      });
    }
    
    if (hintAngles) {
      const hint = hintAngles.find(h => h.id === mirror.id);
      if (hint) {
        const [hintA, hintB] = mirrorEndpoints(mirror.x, mirror.y, mirror.length, hint.angle);
        const existing = cache.mirrorEndpoints.get(mirror.id);
        if (existing) {
          existing.hint = [hintA, hintB];
          existing.hintAngle = hint.angle;
        }
      }
    }
  }
  
  cache.lastRenderTime = now;
}

function renderObstacles(ctx: CanvasRenderingContext2D, obstacles: Array<{ id: string; x: number; y: number; w: number; h: number }>) {
  if (obstacles.length === 0) return;
  
  ctx.fillStyle = COLORS.obstacle;
  ctx.beginPath();
  
  for (const obstacle of obstacles) {
    ctx.rect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
  }
  
  ctx.fill();
}

const targetGlowState = new Map<string, { startTime: number; alpha: number }>();

function renderTargets(
  ctx: CanvasRenderingContext2D,
  targets: Array<{ id: string; x: number; y: number; r: number }>,
  hitIds: string[]
) {
  const hitSet = new Set(hitIds);
  const now = performance.now();
  const GLOW_DURATION = 1600;
  const FADE_DURATION = 400;

  for (const target of targets) {
    const isHit = hitSet.has(target.id);
    let glowData = targetGlowState.get(target.id);

    if (isHit) {
      if (!glowData) {
        glowData = { startTime: now, alpha: 0 };
        targetGlowState.set(target.id, glowData);
      }
      const elapsed = now - glowData.startTime;
      glowData.alpha = Math.min(1, elapsed / GLOW_DURATION);
    } else {
      if (glowData && glowData.alpha > 0) {
        glowData.alpha = Math.max(0, glowData.alpha - 0.02);
        if (glowData.alpha === 0) {
          targetGlowState.delete(target.id);
        }
      }
    }

    const alpha = glowData?.alpha ?? 0;
    const r = target.r;
    const x = target.x;
    const y = target.y;

    if (alpha < 1) {
      ctx.beginPath();
      ctx.strokeStyle = COLORS.targetStroke;
      ctx.lineWidth = 3;
      ctx.fillStyle = COLORS.targetFill;
      ctx.moveTo(x + r, y);
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = COLORS.targetStroke;
      ctx.lineWidth = 2;
      ctx.moveTo(x + r, y);
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (alpha > 0) {
      const strokeAlpha = Math.floor(alpha * 255).toString(16).padStart(2, '0');

      ctx.beginPath();
      ctx.strokeStyle = `${COLORS.targetHit}${strokeAlpha}`;
      ctx.lineWidth = 4;
      ctx.fillStyle = `rgba(126, 231, 135, ${alpha * 0.4})`;
      ctx.moveTo(x + r * 1.5, y);
      ctx.arc(x, y, r * 1.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = `rgba(126, 231, 135, ${alpha * 0.4})`;
      ctx.moveTo(x + r, y);
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.strokeStyle = `${COLORS.targetHit}${strokeAlpha}`;
      ctx.lineWidth = 2;
      ctx.moveTo(x + r * 0.6, y);
      ctx.arc(x, y, r * 0.6, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function renderHintMirrorsOptimized(ctx: CanvasRenderingContext2D, state: GameRenderState) {
  const rotatableMirrors = state.currentLevel.mirrors.filter(m => m.rotatable);
  
  for (const rotatableMirror of rotatableMirrors) {
    const cached = cache.mirrorEndpoints.get(rotatableMirror.id);
    if (!cached || !cached.hint) continue;
    
    const currentAngle = cached.currentAngle;
    const targetAngle = cached.hintAngle!;
    const [a, b] = cached.current;
    const [hintA, hintB] = cached.hint;
    
    // 绘制当前镜子（透明玻璃）
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = COLORS.mirrorRotatable;
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // 绘制目标镜子虚影（虚线）
    ctx.beginPath();
    ctx.moveTo(hintA.x, hintA.y);
    ctx.lineTo(hintB.x, hintB.y);
    ctx.strokeStyle = COLORS.hintMirror;
    ctx.lineWidth = 6;
    ctx.setLineDash([10, 8]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // 旋转指示弧线
    const angleDiff = Math.abs(targetAngle - currentAngle);
    if (angleDiff > 5) {
      const radius = 25;
      const startAngleRad = (currentAngle * Math.PI) / 180;
      const endAngleRad = (targetAngle * Math.PI) / 180;
      
      ctx.beginPath();
      ctx.arc(rotatableMirror.x, rotatableMirror.y, radius, startAngleRad, endAngleRad, targetAngle < currentAngle);
      ctx.strokeStyle = COLORS.hintMirror;
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // 旋转方向指示器
      const arrowX = rotatableMirror.x + Math.cos(endAngleRad) * radius;
      const arrowY = rotatableMirror.y + Math.sin(endAngleRad) * radius;
      
      ctx.beginPath();
      ctx.arc(arrowX, arrowY, 4, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.hintMirror;
      ctx.fill();
    }
    
    // 控制点
    ctx.beginPath();
    ctx.arc(rotatableMirror.x, rotatableMirror.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.mirrorRotatable;
    ctx.fill();
    ctx.strokeStyle = COLORS.mirrorStroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function renderMirrorsOptimized(
  ctx: CanvasRenderingContext2D,
  mirrors: Array<{ id: string; x: number; y: number; length: number; angle: number; rotatable: boolean }>,
  activeMirrorId: string | null,
  hintMode: boolean
) {
  const fixedMirrors: typeof mirrors = [];
  const rotatableMirrors: typeof mirrors = [];
  const activeMirrors: typeof mirrors = [];
  
  for (const mirror of mirrors) {
    if (hintMode && mirror.rotatable) continue;
    
    if (mirror.id === activeMirrorId) {
      activeMirrors.push(mirror);
    } else if (!mirror.rotatable) {
      fixedMirrors.push(mirror);
    } else {
      rotatableMirrors.push(mirror);
    }
  }
  
  // 固定镜子（蓝色玻璃）
  if (fixedMirrors.length > 0) {
    ctx.beginPath();
    ctx.strokeStyle = COLORS.mirrorFixed45;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    
    for (const mirror of fixedMirrors) {
      const cached = cache.mirrorEndpoints.get(mirror.id);
      if (!cached) continue;
      const [a, b] = cached.current;
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
    }
    ctx.stroke();
    
    // 玻璃高光
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    
    for (const mirror of fixedMirrors) {
      const cached = cache.mirrorEndpoints.get(mirror.id);
      if (!cached) continue;
      const [a, b] = cached.current;
      ctx.moveTo(a.x + (b.x - a.x) * 0.3, a.y + (b.y - a.y) * 0.3);
      ctx.lineTo(b.x, b.y);
    }
    ctx.stroke();
  }
  
  // 可旋转镜子（白色玻璃）
  if (rotatableMirrors.length > 0) {
    ctx.beginPath();
    ctx.strokeStyle = COLORS.mirrorRotatable;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    
    for (const mirror of rotatableMirrors) {
      const cached = cache.mirrorEndpoints.get(mirror.id);
      if (!cached) continue;
      const [a, b] = cached.current;
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
    }
    ctx.stroke();
    
    // 玻璃高光
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    
    for (const mirror of rotatableMirrors) {
      const cached = cache.mirrorEndpoints.get(mirror.id);
      if (!cached) continue;
      const [a, b] = cached.current;
      ctx.moveTo(a.x + (b.x - a.x) * 0.3, a.y + (b.y - a.y) * 0.3);
      ctx.lineTo(b.x, b.y);
    }
    ctx.stroke();
  }
  
  // 活动镜子（亮白色玻璃）
  if (activeMirrors.length > 0) {
    ctx.beginPath();
    ctx.strokeStyle = COLORS.mirrorActive;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    
    for (const mirror of activeMirrors) {
      const cached = cache.mirrorEndpoints.get(mirror.id);
      if (!cached) continue;
      const [a, b] = cached.current;
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
    }
    ctx.stroke();
  }
  
  // 控制点
  ctx.beginPath();
  ctx.fillStyle = COLORS.mirrorRotatable;
  ctx.strokeStyle = COLORS.mirrorStroke;
  ctx.lineWidth = 2;
  
  for (const mirror of [...fixedMirrors, ...rotatableMirrors, ...activeMirrors]) {
    ctx.moveTo(mirror.x + 6, mirror.y);
    ctx.arc(mirror.x, mirror.y, 6, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.stroke();
}

function renderBeamOptimized(ctx: CanvasRenderingContext2D, state: GameRenderState) {
  const isHint = state.hintMode && state.hintMirrorAngles.length > 0 && !state.activeMirrorId;
  const segments = state.rayResult?.segments || [];
  
  if (segments.length === 0) return;
  
  // 外发光
  ctx.beginPath();
  ctx.strokeStyle = isHint ? 'rgba(255, 255, 255, 0.15)' : COLORS.beamGlow;
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  
  for (const seg of segments) {
    ctx.moveTo(seg.from.x, seg.from.y);
    ctx.lineTo(seg.to.x, seg.to.y);
  }
  ctx.stroke();
  
  // 核心光束
  ctx.beginPath();
  ctx.strokeStyle = isHint ? 'rgba(255, 255, 255, 0.4)' : COLORS.beam;
  ctx.lineWidth = 2;
  
  if (isHint) {
    ctx.setLineDash([6, 6]);
  }
  
  for (const seg of segments) {
    ctx.moveTo(seg.from.x, seg.from.y);
    ctx.lineTo(seg.to.x, seg.to.y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineCap = 'butt';
}

function renderEmitterOptimized(ctx: CanvasRenderingContext2D, emitter: { x: number; y: number; angle: number }) {
  const angleRad = (emitter.angle * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  
  // 外发光
  const gradient = ctx.createRadialGradient(emitter.x, emitter.y, 0, emitter.x, emitter.y, 50);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)');
  gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.1)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.beginPath();
  ctx.arc(emitter.x, emitter.y, 50, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // 光球核心
  const coreGradient = ctx.createRadialGradient(emitter.x, emitter.y, 0, emitter.x, emitter.y, 15);
  coreGradient.addColorStop(0, '#FFFFFF');
  coreGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
  coreGradient.addColorStop(1, 'rgba(255, 255, 255, 0.6)');
  
  ctx.beginPath();
  ctx.arc(emitter.x, emitter.y, 15, 0, Math.PI * 2);
  ctx.fillStyle = coreGradient;
  ctx.fill();
  
  // 光球边框
  ctx.beginPath();
  ctx.arc(emitter.x, emitter.y, 14, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(88, 166, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // 发射方向指示线
  ctx.beginPath();
  ctx.moveTo(emitter.x + cos * 15, emitter.y + sin * 15);
  ctx.lineTo(emitter.x + cos * 40, emitter.y + sin * 40);
  ctx.strokeStyle = COLORS.beam;
  ctx.lineWidth = 2;
  ctx.stroke();
}

export function renderGame(canvas: HTMLCanvasElement, state: GameRenderState & { clearAnimState?: any }) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { width, height } = canvas;
  const now = performance.now();
  
  // 清除画布
  ctx.clearRect(0, 0, width, height);

  // 绘制背景
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, width, height);

  // 预计算镜子端点
  const hintAngles = state.hintMode ? state.hintMirrorAngles : undefined;
  precomputeMirrorEndpoints(state.currentLevel, hintAngles);

  // 绘制障碍物
  renderObstacles(ctx, state.currentLevel.obstacles);

  // 绘制目标
  renderTargets(ctx, state.currentLevel.targets, state.hitTargetIds || []);

  // 绘制提示虚影镜子
  if (state.hintMode && state.hintMirrorAngles.length > 0 && !state.activeMirrorId) {
    renderHintMirrorsOptimized(ctx, state);
  }

  // 绘制镜子
  renderMirrorsOptimized(ctx, state.currentLevel.mirrors, state.activeMirrorId, state.hintMode);

  // 绘制光束
  renderBeamOptimized(ctx, state);

  // 绘制发射器
  renderEmitterOptimized(ctx, state.currentLevel.emitter);

  // 更新缓存时间
  cache.lastRenderTime = now;
}
