import { useGameStore } from '../game/engine/gameStore';
import { levels } from '../levels';

type MenuView = 'main' | 'level-select' | 'settings' | 'credits';

export function Menu() {
  const initializeGame = useGameStore((s) => s.initializeGame);
  const setLevelByIndex = useGameStore((s) => s.setLevelByIndex);
  const setShowMenu = useGameStore((s) => s.setShowMenu);
  const levelIndex = useGameStore((s) => s.levelIndex);
  const [currentView, setCurrentView] = React.useState<MenuView>('main');

  const startNewGame = () => {
    // 从第1关开始新游戏
    setLevelByIndex(0);
  };

  const goToLevel = (idx: number) => {
    setLevelByIndex(idx);
  };

  if (currentView === 'level-select') {
    return <LevelSelectView 
      levels={levels} 
      currentLevelIndex={levelIndex}
      onSelect={goToLevel}
      onBack={() => setCurrentView('main')}
    />;
  }

  if (currentView === 'settings') {
    return <SettingsView onBack={() => setCurrentView('main')} />;
  }

  if (currentView === 'credits') {
    return <CreditsView onBack={() => setCurrentView('main')} />;
  }

  return (
    <div className="menu-container">
      <div className="menu-content">
        <h1 className="menu-title glowing-text">LUMEN</h1>
        <p className="menu-subtitle">光线折射解谜游戏</p>
        
        <div className="menu-buttons">
          <div className="menu-button primary" onClick={startNewGame}>
            新游戏
          </div>
          <div className="menu-button" onClick={() => setCurrentView('level-select')}>
            关卡选择
          </div>
          <div className="menu-button" onClick={() => setCurrentView('settings')}>
            设置
          </div>
          <div className="menu-button" onClick={() => setCurrentView('credits')}>
            创作人员
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';

function LevelSelectView({ 
  levels, 
  currentLevelIndex,
  onSelect,
  onBack 
}: { 
  levels: any[]; 
  currentLevelIndex: number;
  onSelect: (idx: number) => void;
  onBack: () => void;
}) {
  const completedLevels = useGameStore((s) => s.completedLevels);

  return (
    <div className="menu-container">
      <div className="menu-content level-select">
        <button className="back-button" onClick={onBack}>← 返回</button>
        <h2 className="menu-title">选择关卡</h2>
        
        <div className="level-grid">
          {levels.map((_, idx) => {
            const isCompleted = completedLevels.includes(idx + 1);
            const isCurrent = idx === currentLevelIndex;
            
            return (
              <button
                key={idx}
                className={`level-button ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                onClick={() => onSelect(idx)}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SettingsView({ onBack }: { onBack: () => void }) {
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const setSoundEnabled = useGameStore((s) => s.setSoundEnabled);

  return (
    <div className="menu-container">
      <div className="menu-content settings">
        <button className="back-button" onClick={onBack}>← 返回</button>
        <h2 className="menu-title">设置</h2>
        
        <div className="settings-item">
          <span>音效</span>
          <button 
            className={`toggle-button ${soundEnabled ? 'on' : 'off'}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? '开' : '关'}
          </button>
        </div>
        
        <div className="settings-info">
          <p>游戏版本: 0.4.0</p>
          <p>总计关卡: {levels.length}</p>
        </div>
      </div>
    </div>
  );
}

function CreditsView({ onBack }: { onBack: () => void }) {
  return (
    <div className="menu-container">
      <div className="menu-content credits">
        <button className="back-button" onClick={onBack}>← 返回</button>
        <h2 className="menu-title">About the Crew</h2>
        
        <div className="credits-content">
          <div className="credit-item">
            <h3>游戏设计</h3>
            <p>matelanlan & trae</p>
          </div>
          
          <div className="credit-item">
            <h3>开发</h3>
            <p>由 Trae AI 辅助开发</p>
          </div>
          
          <div className="credit-item">
            <h3>灵感来源</h3>
            <p>Klocki, Chromatron, Lazors</p>
          </div>
          
          <div className="credit-item">
            <h3>技术栈</h3>
            <p>React + TypeScript + Canvas</p>
          </div>
        </div>
        
        <p className="credits-footer">
          © 2024 Lumen. 保留所有权利。
        </p>
      </div>
    </div>
  );
}