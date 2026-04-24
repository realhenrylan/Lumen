import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './gameStore';

describe('Game Store', () => {
  beforeEach(() => {
    useGameStore.setState({
      levelIndex: 0,
      solved: false,
      hintText: null,
    });
  });

  describe('Level Navigation', () => {
    it('starts at level 0', () => {
      const state = useGameStore.getState();
      expect(state.levelIndex).toBe(0);
      expect(state.solved).toBe(false);
    });

    it('advances to next level', () => {
      const state = useGameStore.getState();
      state.nextLevel();
      const newState = useGameStore.getState();
      expect(newState.levelIndex).toBe(1);
      expect(newState.solved).toBe(false);
    });

    it('does not exceed last level', () => {
      const state = useGameStore.getState();
      for (let i = 0; i < 25; i++) {
        state.nextLevel();
      }
      const newState = useGameStore.getState();
      expect(newState.levelIndex).toBeLessThan(20);
    });

    it('resets current level', () => {
      const state = useGameStore.getState();
      state.nextLevel();
      state.resetLevel();
      const newState = useGameStore.getState();
      expect(newState.levelIndex).toBe(1);
    });
  });

  describe('Mirror Rotation', () => {
    it('updates mirror angle', () => {
      const state = useGameStore.getState();
      const mirror = state.currentLevel.mirrors[0];
      const originalAngle = mirror.angle;
      
      state.setMirrorAngle(mirror.id, originalAngle + 10);
      const newState = useGameStore.getState();
      expect(newState.currentLevel.mirrors[0].angle).not.toBe(originalAngle);
    });

    it('ignores updates to non-rotatable mirrors', () => {
      const state = useGameStore.getState();
      const nonRotatableMirror = state.currentLevel.mirrors.find(m => !m.rotatable);
      if (nonRotatableMirror) {
        const originalAngle = nonRotatableMirror.angle;
        state.setMirrorAngle(nonRotatableMirror.id, 999);
        const newState = useGameStore.getState();
        expect(newState.currentLevel.mirrors.find(m => m.id === nonRotatableMirror.id)?.angle).toBe(originalAngle);
      }
    });
  });

  describe('Hint System', () => {
    it('shows hint when requested', () => {
      const state = useGameStore.getState();
      state.requestHint();
      const newState = useGameStore.getState();
      expect(newState.hintText).not.toBeNull();
    });

    it('clears hint on mirror rotation', () => {
      const state = useGameStore.getState();
      state.requestHint();
      const mirror = state.currentLevel.mirrors[0];
      state.setMirrorAngle(mirror.id, 45);
      const newState = useGameStore.getState();
      expect(newState.hintText).toBeNull();
    });
  });
});
