import { useEffect, useRef } from 'react';
import { Controls } from '../ui/Controls';
import { HUD } from '../ui/HUD';
import { useGameStore } from '../game/engine/gameStore';
import { renderGame } from '../game/render/renderer';
import { setupPointerInput } from '../game/input/pointer';

export function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const resetLevel = useGameStore((s) => s.resetLevel);
  const nextLevel = useGameStore((s) => s.nextLevel);
  const requestHint = useGameStore((s) => s.requestHint);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cleanupInput = setupPointerInput(canvas);
    let raf = 0;

    const frame = () => {
      renderGame(canvas, useGameStore.getState());
      raf = requestAnimationFrame(frame);
    };

    frame();

    return () => {
      cancelAnimationFrame(raf);
      cleanupInput();
    };
  }, []);

  return (
    <div className="app-root">
      <HUD />
      <canvas ref={canvasRef} width={960} height={540} className="game-canvas" />
      <Controls onReset={resetLevel} onHint={requestHint} onNext={nextLevel} />
    </div>
  );
}
