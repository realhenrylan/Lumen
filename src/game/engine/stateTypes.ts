/**
 * 游戏渲染状态类型定义
 * 用于在渲染器和游戏状态之间传递数据
 */

/** 提示镜子数据结构 */
export type HintMirror = {
  id: string;
  angle: number;
};

/** 光线追踪结果 */
export type RaycastResult = {
  segments: Array<{ from: { x: number; y: number }; to: { x: number; y: number } }>;
  hitTargetIds: string[];
};

/** 游戏渲染状态 */
export type GameRenderState = {
  /** 当前关卡数据 */
  currentLevel: {
    id: number;
    emitter: { x: number; y: number; angle: number };
    mirrors: Array<{ id: string; x: number; y: number; length: number; angle: number; rotatable: boolean }>;
    targets: Array<{ id: string; x: number; y: number; r: number }>;
    obstacles: Array<{ id: string; x: number; y: number; w: number; h: number }>;
  };
  /** 是否已过关 */
  solved: boolean;
  /** 当前激活的镜子ID */
  activeMirrorId: string | null;
  /** 提示模式下镜子的角度数组 */
  hintMirrorAngles: HintMirror[];
  /** 是否为提示模式 */
  hintMode: boolean;
  /** 被击中的目标ID数组 */
  hitTargetIds: string[];
  /** 光线追踪结果缓存 */
  rayResult?: RaycastResult;
};
