import type { GameRenderState } from '../engine/stateTypes';
import { raycastLevel } from '../core/raycast';
import { mirrorEndpoints } from '../core/math';

export function renderGame(canvas: HTMLCanvasElement, state: GameRenderState) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = '#0B0F14';
  ctx.fillRect(0, 0, width, height);

  for (const obstacle of state.currentLevel.obstacles) {
    ctx.fillStyle = '#1C2633';
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
  }

  for (const target of state.currentLevel.targets) {
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.r, 0, Math.PI * 2);
    ctx.strokeStyle = '#7f8ea3';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  for (const mirror of state.currentLevel.mirrors) {
    const [a, b] = mirrorEndpoints(mirror.x, mirror.y, mirror.length, mirror.angle);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = '#C8D0DD';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  const ray = raycastLevel(state.currentLevel);
  ctx.strokeStyle = '#6BE8FF';
  ctx.shadowColor = '#6BE8FF';
  ctx.shadowBlur = 10;
  ctx.lineWidth = 2;
  for (const seg of ray.segments) {
    ctx.beginPath();
    ctx.moveTo(seg.from.x, seg.from.y);
    ctx.lineTo(seg.to.x, seg.to.y);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  ctx.beginPath();
  ctx.arc(state.currentLevel.emitter.x, state.currentLevel.emitter.y, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#9FB3C8';
  ctx.fill();

  if (state.solved) {
    ctx.fillStyle = 'rgba(10, 14, 20, 0.65)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#d5f4ff';
    ctx.font = '600 36px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Level Clear', width / 2, height / 2);
  }
}
