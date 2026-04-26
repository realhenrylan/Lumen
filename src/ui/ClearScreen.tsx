import { useEffect, useState } from 'react';
import { useGameStore } from '../game/engine/gameStore';

export function ClearScreen() {
  const levelIndex = useGameStore((s) => s.levelIndex);
  const nextLevel = useGameStore((s) => s.nextLevel);
  const setShowMenu = useGameStore((s) => s.setShowMenu);
  const setClearScreen = useGameStore((s) => s.setClearScreen);
  const [showContent, setShowContent] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleNextLevel = () => {
    setFadeOut(true);
    setTimeout(() => {
      setClearScreen(false);
      nextLevel();
    }, 500);
  };

  const handleGoToMenu = () => {
    setFadeOut(true);
    setTimeout(() => {
      setClearScreen(false);
      setShowMenu(true);
    }, 500);
  };

  return (
    <div className={`clear-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className={`clear-content ${showContent ? 'show' : ''}`}>
        <h1 className="clear-title glowing-text">LEVEL CLEAR!</h1>
        <p className="clear-subtitle">恭喜通过第 {levelIndex + 1} 关</p>
        
        <div className="clear-buttons">
          <div 
            className="clear-button primary" 
            onClick={handleNextLevel}
            style={{ opacity: levelIndex >= 49 ? 0.4 : 1, cursor: levelIndex >= 49 ? 'not-allowed' : 'pointer' }}
          >
            {levelIndex >= 49 ? '全部通关!' : '下一关 →'}
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
