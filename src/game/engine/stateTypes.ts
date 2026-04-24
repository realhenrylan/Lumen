export type GameRenderState = {
  currentLevel: {
    emitter: { x: number; y: number; angle: number };
    mirrors: Array<{ id: string; x: number; y: number; length: number; angle: number; rotatable: boolean }>;
    targets: Array<{ id: string; x: number; y: number; r: number }>;
    obstacles: Array<{ id: string; x: number; y: number; w: number; h: number }>;
  };
  solved: boolean;
};
