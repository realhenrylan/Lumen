import { useEffect } from 'react';
import { useGameStore } from '../game/engine/gameStore';

export function ClearScreen() {
  const levelIndex = useGameStore((s) => s.levelIndex);
  const nextLevel = useGameStore((s) => s.nextLevel);
  const setShowMenu = useGameStore((s) => s.setShowMenu);
  const setClearScreen = useGameStore((s) => s.setClearScreen);

  const handleNextLevel = () => {
    setClearScreen(false);
    nextLevel();
  };

  const handleGoToMenu = () => {
    setClearScreen(false);
    setShowMenu(true);
  };

  return (
    <div className="clear-screen">
      <div className="clear-content">
        <h1 className="clear-title">LEVEL CLEAR!</h1>
        <p className="clear-subtitle">恭喜通过第 {levelIndex + 1} 关</p>
        
        <div className="clear-buttons">
          <div 
            className="clear-button primary" 
            onClick={handleNextLevel}
            style={{ opacity: levelIndex >= 49 ? 0.4 : 1, cursor: levelIndex >= 49 ? 'not-allowed' : 'pointer' }}
          >
            下一关
          </div>
          
          <div 
            className="clear-button" 
            onClick={handleGoToMenu}
          >
            返回菜单
          </div>
        </div>
      </div>
    </div>
  );
}
