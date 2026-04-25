import { useGameStore } from '../engine/gameStore';
import { radToDeg } from '../core/math';

const ROTATION_DEAD_ZONE = 0.5;
const TOUCH_HIT_RADIUS = 0.8;

export function setupPointerInput(canvas: HTMLCanvasElement): () => void {
  let activeMirrorId: string | null = null;
  let lastAngle: number | null = null;
  let isHintDrag: boolean = false;

  const onPointerDown = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const state = useGameStore.getState();
    const level = state.currentLevel;
    const hit = level.mirrors.find((m) => Math.hypot(m.x - x, m.y - y) < m.length * TOUCH_HIT_RADIUS && m.rotatable);
    if (!hit) return;

    activeMirrorId = hit.id;
    lastAngle = null;
    isHintDrag = state.hintMode;
    useGameStore.getState().setActiveMirror(hit.id);
    canvas.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!activeMirrorId) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const level = useGameStore.getState().currentLevel;
    const mirror = level.mirrors.find((m) => m.id === activeMirrorId);
    if (!mirror) return;

    const newAngle = radToDeg(Math.atan2(y - mirror.y, x - mirror.x));

    if (lastAngle !== null) {
      let delta = newAngle - lastAngle;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      
      if (Math.abs(delta) < ROTATION_DEAD_ZONE) {
        return;
      }
    }

    lastAngle = newAngle;
    
    if (isHintDrag) {
      useGameStore.getState().updateHintAngle(activeMirrorId, newAngle);
    } else {
      useGameStore.getState().setMirrorAngle(activeMirrorId, newAngle);
    }
  };

  const onPointerUp = (e: PointerEvent) => {
    activeMirrorId = null;
    lastAngle = null;
    isHintDrag = false;
    useGameStore.getState().setActiveMirror(null);
    if (canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);

  return () => {
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointercancel', onPointerUp);
  };
}
