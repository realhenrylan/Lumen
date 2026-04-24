# Lumen (V1)

一个极简的光学反射解谜原型：旋转镜面，让光束反射后命中全部目标点。

## 技术栈

- React + TypeScript + Vite
- Canvas 2D
- Zustand（游戏状态）

## 启动

```bash
npm install
npm run dev
```

## 当前实现内容（V1）

- 发射器 + 镜子 + 目标点 + 障碍物
- 鼠标/触摸旋转镜子
- 实时光线追踪与反射
- 命中所有目标判定过关
- 20 关 JSON 数据驱动
- 按钮：重置 / 提示 / 下一关

## 核心模块

- `src/game/core/math.ts`：向量与反射运算
- `src/game/core/collision.ts`：射线与镜面/障碍相交
- `src/game/core/raycast.ts`：多段反射追踪与目标命中
- `src/levels/levels.json`：关卡定义
- `src/game/render/renderer.ts`：Canvas 渲染
- `src/game/input/pointer.ts`：PC/移动统一输入

## 下阶段建议

- 提示系统改为真正解算（当前是基础提示文本）
- 增加关卡编辑器与导入导出
- 做移动端灵敏度和手势细化
- 增加音效与细微过渡动画
