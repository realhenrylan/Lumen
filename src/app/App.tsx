/**
 * Lumen 游戏主应用组件
 * 
 * 负责：
 * - 显示菜单页面或游戏界面
 * - 初始化游戏状态
 * - 设置Canvas渲染循环
 * - 全屏布局
 */

import { useEffect, useRef } from 'react';
import { HUD } from '../ui/HUD';
import { Menu } from '../ui/Menu';
import { PauseMenu } from '../ui/PauseMenu';
import { ClearScreen } from '../ui/ClearScreen';
import { useGameStore } from '../game/engine/gameStore';
import { renderGame } from '../game/render/renderer';
import { setupPointerInput } from '../game/input/pointer';

export function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const resetLevel = useGameStore((s) => s.resetLevel);
  const requestHint = useGameStore((s) => s.requestHint);
  const initializeGame = useGameStore((s) => s.initializeGame);
  const showMenu = useGameStore((s) => s.showMenu);
  const paused = useGameStore((s) => s.paused);
  const clearScreen = useGameStore((s) => s.clearScreen);
  const setPaused = useGameStore((s) => s.setPaused);

  // 初始化游戏
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // 渲染循环 - 必须在条件语句之前
  useEffect(() => {
    // 如果显示菜单、暂停或过关界面，不初始化渲染循环
    if (showMenu || paused || clearScreen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // 设置输入处理
    const cleanupInput = setupPointerInput(canvas);
    
    let raf = 0;

    const frame = () => {
      // 获取当前状态
      const state = useGameStore.getState();
      
      // 渲染游戏（使用store中的光线追踪结果）
      renderGame(canvas, {
        ...state,
        hitTargetIds: state.rayResult.hitTargetIds,
      });
      
      raf = requestAnimationFrame(frame);
    };

    frame();

    // 清理函数
    return () => {
      cancelAnimationFrame(raf);
      cleanupInput();
    };
  }, [showMenu, paused, clearScreen]);

  // 如果显示菜单，则只渲染菜单
  if (showMenu) {
    return <Menu />;
  }

  return (
    <div className="app-root">
      {/* 左上角 - 暂停按钮 */}
      <div className="top-left">
        <div className="pause-icon" onClick={() => setPaused(true)}>
          <div className="pause-line"></div>
          <div className="pause-line"></div>
        </div>
      </div>

      {/* 顶部中间 - HUD信息 */}
      <div className="top-center">
        <HUD />
      </div>

      {/* 右上角 - 提示、重置按钮 */}
      <div className="top-right">
        <div className="top-right-buttons">
          <div className="hint-icon" onClick={requestHint}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="none"/>
              <path d="M20 20C20 16 24 14 24 14C24 14 28 16 28 20C28 22 26 24 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
              <circle cx="24" cy="32" r="2" fill="currentColor"/>
            </svg>
          </div>
          <div className="reset-icon" onClick={resetLevel}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M8 24C8 15.2 15.2 8 24 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
              <path d="M8 8L16 8L8 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M40 24C40 32.8 32.8 40 24 40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
              <path d="M40 40L32 40L40 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
        </div>
      </div>

      {/* 中间 - 游戏画布 */}
      <div className="game-container">
        <canvas ref={canvasRef} width="2560" height="1440" className="game-canvas" />
      </div>

      {/* 暂停界面 */}
      {paused && <PauseMenu />}
      
      {/* 过关界面 */}
      {clearScreen && <ClearScreen />}
    </div>
  );
}
