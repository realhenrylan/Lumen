import { useGameStore } from '../game/engine/gameStore';

export function HUD() {
  const levelIndex = useGameStore((s) => s.levelIndex);

  return (
    <div className="hud-item">
      <span className="level-display">LEVEL {levelIndex + 1}</span>
    </div>
  );
}
