import { useGameStore } from '../game/engine/gameStore';

export function PauseMenu() {
  const setPaused = useGameStore((s) => s.setPaused);
  const setShowMenu = useGameStore((s) => s.setShowMenu);
  const nextLevel = useGameStore((s) => s.nextLevel);
  const previousLevel = useGameStore((s) => s.previousLevel);
  const levelIndex = useGameStore((s) => s.levelIndex);

  const handleContinue = () => {
    setPaused(false);
  };

  const handlePrevious = () => {
    if (levelIndex === 0) return;
    previousLevel();
    setPaused(false);
  };

  const handleNext = () => {
    if (levelIndex >= 49) return;
    nextLevel();
    setPaused(false);
  };

  const handleMenu = () => {
    setPaused(false);
    setShowMenu(true);
  };

  return (
    <div className="pause-overlay">
      <h2 className="pause-title">暂停</h2>
      
      <div className="pause-buttons">
        <div className="pause-button primary" onClick={handleContinue}>
          继续游戏
        </div>
        
        <div 
          className="pause-button" 
          onClick={handlePrevious}
          style={{ opacity: levelIndex === 0 ? 0.3 : 1 }}
        >
          上一关
        </div>
        
        <div 
          className="pause-button" 
          onClick={handleNext}
          style={{ opacity: levelIndex >= 49 ? 0.3 : 1 }}
        >
          下一关
        </div>
        
        <div className="pause-button" onClick={handleMenu}>
          主菜单
        </div>
      </div>
    </div>
  );
}
