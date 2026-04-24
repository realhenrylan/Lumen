import { useGameStore } from '../game/engine/gameStore';

export function HUD() {
  const level = useGameStore((s) => s.currentLevel);
  const levelIndex = useGameStore((s) => s.levelIndex);
  const solved = useGameStore((s) => s.solved);
  const hintText = useGameStore((s) => s.hintText);

  return (
    <div className="panel">
      <div>Level {levelIndex + 1} / 20</div>
      <div>{solved ? '已过关' : '进行中'}</div>
      <div>{hintText ?? `目标数：${level.targets.length}`}</div>
    </div>
  );
}
