/**
 * 游戏核心类型定义
 */

/** 二维坐标点 */
export type Point = { x: number; y: number };

/** 发射器数据结构 */
export type Emitter = {
  x: number;
  y: number;
  angle: number;
};

/** 
 * 镜子类型枚举
 * - rotatable: 可旋转的镜子
 * - fixed45: 固定45度镜子（斜向右上）
 * - fixed135: 固定135度镜子（斜向左上）
 */
export type MirrorType = 'rotatable' | 'fixed45' | 'fixed135';

/** 
 * 镜子数据结构
 * 
 * 可旋转镜子：玩家可以拖动改变角度
 * 固定镜子：在关卡中作为固定障碍物/反射面
 */
export type Mirror = {
  id: string;
  x: number;
  y: number;
  length: number;
  angle: number;
  rotatable: boolean;
  type?: MirrorType; // 镜子类型，默认为rotatable
};

/** 目标点数据结构 */
export type Target = {
  id: string;
  x: number;
  y: number;
  r: number;
};

/** 障碍物数据结构 */
export type Obstacle = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

/** 关卡数据结构 */
export type Level = {
  id: number;
  emitter: Emitter;
  mirrors: Mirror[];
  targets: Target[];
  obstacles: Obstacle[];
};

/** 光线线段数据结构 */
export type RaySegment = {
  from: Point;
  to: Point;
};

/** 光线追踪结果 */
export type RaycastResult = {
  segments: RaySegment[];
  hitTargetIds: string[];
};

/** 提示镜子数据结构 */
export type HintMirror = {
  id: string;
  angle: number;
};
