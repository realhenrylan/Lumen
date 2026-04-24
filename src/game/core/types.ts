export type Point = { x: number; y: number };

export type Emitter = {
  x: number;
  y: number;
  angle: number;
};

export type Mirror = {
  id: string;
  x: number;
  y: number;
  length: number;
  angle: number;
  rotatable: boolean;
};

export type Target = {
  id: string;
  x: number;
  y: number;
  r: number;
};

export type Obstacle = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Level = {
  id: number;
  emitter: Emitter;
  mirrors: Mirror[];
  targets: Target[];
  obstacles: Obstacle[];
};

export type RaySegment = {
  from: Point;
  to: Point;
};

export type RaycastResult = {
  segments: RaySegment[];
  hitTargetIds: string[];
};
