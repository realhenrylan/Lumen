# Level Solver Checker Skill

## 简介

这个skill用于检查光线反射谜题游戏关卡的可解性。

## 功能

1. **镜子-光束碰撞检测**：检查每个镜子是否能被光束击中
2. **镜子位置验证**：验证镜子初始位置是否正确
3. **目标可达性分析**：确定哪些目标可以被击中
4. **障碍物影响评估**：分析障碍物如何阻挡光路
5. **难度评估**：评估关卡难度（简单/中等/困难/专家）

## 使用方法

### 方法1：命令行工具

```bash
# 分析所有关卡
node check-level.cjs

# 分析特定关卡
node check-level.cjs 1
node check-level.cjs 6
```

### 方法2：在代码中使用

```typescript
import { levels } from './src/levels';
import {
  analyzeLevelSolvability,
  verifyLevelCompleteness,
  checkMirrorBeamCollision
} from './src/levels/analyzeLevelSolvability';

// 基础分析
const level = levels[0];
const result = analyzeLevelSolvability(level);

console.log(result.isSolvable); // true/false
console.log(result.confidence); // 0-100
console.log(result.issues); // 问题列表

// 完整报告
const report = verifyLevelCompleteness(level);
console.log(report.difficulty); // 'easy' | 'medium' | 'hard' | 'expert'
console.log(report.suggestions); // 改进建议

// 镜子碰撞详情
const collision = checkMirrorBeamCollision(level);
console.log(collision.mirrors);
```

## API

### analyzeLevelSolvability(level: Level)

返回：
- `isSolvable`: boolean - 关卡是否可解
- `mirrorsCanBeReached`: string[] - 可以被击中的镜子ID
- `mirrorsCannotBeReached`: string[] - 无法被击中的镜子ID
- `reachableTargets`: string[] - 可以达到的目标ID
- `blockedTargets`: string[] - 被阻挡的目标ID
- `issues`: string[] - 详细问题列表
- `confidence`: number - 可解性置信度 (0-100)

### verifyLevelCompleteness(level: Level)

返回详细的完整报告，包括：
- 每个镜子的可达性分析
- 每个目标的可达性分析
- 每个障碍物的影响分析
- 改进建议列表
- 难度等级评估

### checkMirrorBeamCollision(level: Level)

返回每个镜子的光线碰撞详情，包括：
- 镜子位置和角度
- 光束碰撞次数
- 是否可达

## 常见问题和解决方案

### 问题：镜子无法被光束击中
**解决方案**：调整镜子x/y位置，使其位于光束路径上

### 问题：目标被障碍物阻挡
**解决方案**：添加额外的镜子，使光束绕过障碍物

### 问题：镜子角度无法将光线反射到目标
**解决方案**：使用反射数学计算最优角度

### 问题：多目标需要复杂的光路
**解决方案**：规划通过多个镜子的连续反射

## 示例

### 分析第1关
```bash
node check-level.cjs 1
```

输出示例：
```
=== Level 1 Analysis ===

Solvability: ✓ SOLVABLE
Confidence: 100%

Mirrors:
  Can be reached: m1
  Cannot be reached: None

Targets:
  Reachable: t1
  Blocked: None

Mirror-Beam Collision Details:
  Mirror m1:
    Position: (400, 270)
    Angle: 0°
    Beam collisions: 1
    Reachable: Yes
```

### 分析第11关（有障碍物）
```bash
node check-level.cjs 11
```

输出示例：
```
=== Level 11 Analysis ===

Solvability: ✓ SOLVABLE
Confidence: 85%

Mirrors:
  Can be reached: m1, m2
  Cannot be reached: None

Targets:
  Reachable: t1
  Blocked: None

Issues:
  - Target t1 requires precise mirror angles due to obstacle o1

Mirror-Beam Collision Details:
  Mirror m1:
    Position: (280, 260)
    Angle: 0°
    Beam collisions: 1
    Reachable: Yes
  Mirror m2:
    Position: (550, 260)
    Angle: 0°
    Beam collisions: 2
    Reachable: Yes
```

## 测试

```bash
# 运行单元测试
npm run test

# 运行类型检查
npm run typecheck

# 验证所有关卡
npm run test:run
```
