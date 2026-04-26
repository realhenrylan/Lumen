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

  const lastRenderStateRef = useRef<any>(null);
  const needsRenderRef = useRef(true);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    if (showMenu || paused || clearScreen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const cleanupInput = setupPointerInput(canvas);
    
    let raf = 0;
    let lastFrameTime = 0;
    const TARGET_FPS = 60;
    const FRAME_INTERVAL = 1000 / TARGET_FPS;

    const shouldRender = (state: any): boolean => {
      const last = lastRenderStateRef.current;
      if (!last) return true;

      if (state.levelIndex !== last.levelIndex) return true;
      if (state.activeMirrorId !== last.activeMirrorId) return true;
      if (state.hintMode !== last.hintMode) return true;
      
      const currentAngles = state.currentLevel.mirrors.map((m: any) => `${m.id}:${m.angle}`).join(',');
      const lastAngles = last.currentLevel?.mirrors.map((m: any) => `${m.id}:${m.angle}`).join(',');
      if (currentAngles !== lastAngles) return true;
      
      const currentHits = (state.rayResult?.hitTargetIds || []).sort().join(',');
      const lastHits = (last.rayResult?.hitTargetIds || []).sort().join(',');
      if (currentHits !== lastHits) return true;

      const hasTargets = state.currentLevel.targets.length > 0;
      if (hasTargets) return true;
      
      return false;
    };

    const frame = (timestamp: number) => {
      const deltaTime = timestamp - lastFrameTime;
      
      if (deltaTime >= FRAME_INTERVAL) {
        lastFrameTime = timestamp - (deltaTime % FRAME_INTERVAL);
        
        const state = useGameStore.getState();
        
        if (shouldRender(state)) {
          renderGame(canvas, {
            ...state,
            hitTargetIds: state.rayResult.hitTargetIds,
          });
          lastRenderStateRef.current = state;
        }
      }
      
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

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
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div className="reset-icon" onClick={resetLevel}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
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
