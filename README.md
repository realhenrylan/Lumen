# Lumen - 光线折射解谜游戏

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-blue" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.0-purple" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-5.4-blue" alt="Vite">
</p>

一个极简美学的光线折射解谜游戏。旋转镜子，引导光线击中所有目标点。

## ✨ 特性

### 🎮 游戏性
- 50 个精心设计的关卡
- 直观的镜子旋转控制
- 智能提示系统
- 自动保存游戏进度
- 流畅的丝滑动画效果

### 🎨 极简美学设计
- 深色主题界面
- 白色光束效果
- 透明玻璃镜子
- 发光目标点
- 毛玻璃效果

### 🎯 用户界面
- 全屏游戏体验
- 简约线条图标
- 丝滑过渡动画
- 响应式设计

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试
npm run test

# 构建生产版本
npm run build
```

## 🎮 操作指南

### 旋转镜子
- **鼠标/触摸**：点击并拖动镜子控制旋转
- **提示**：点击右上角的提示按钮查看建议角度

### 游戏目标
- 旋转镜子使光线反射击中所有目标点
- 目标点被击中后会发出绿色光芒

## 🛠️ 技术栈

- **React 18** - UI 框架
- **TypeScript 5** - 类型安全
- **Vite 5** - 快速开发体验
- **Zustand** - 状态管理
- **Vitest** - 单元测试
- **Canvas 2D** - 游戏渲染

## 📁 项目结构

```
src/
├── app/           # 应用入口
├── game/          # 游戏核心逻辑
│   ├── core/     # 数学/物理引擎
│   ├── engine/    # 游戏状态管理
│   ├── render/   # Canvas 渲染
│   └── input/    # 输入处理
├── levels/       # 关卡数据
├── ui/            # UI 组件
└── styles/        # 全局样式
```

## 🎯 核心模块

- `src/game/core/raycast.ts` - 光线追踪算法
- `src/game/core/math.ts` - 向量数学运算
- `src/game/core/collision.ts` - 碰撞检测
- `src/game/render/renderer.ts` - Canvas 渲染引擎

## 📝 开发团队

由 **Trae AI** 辅助开发

---

**享受解谜的乐趣！** 💡
