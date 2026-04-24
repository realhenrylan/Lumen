---
name: level-solver-checker
description: Checks level solvability in a light reflection puzzle game. Analyzes mirror placement, beam collision, obstacles, and target accessibility. Invoke when creating/testing new levels or debugging unsolvable levels.
---

# Level Solver Checker

This skill analyzes light reflection puzzle levels to determine if they are solvable and provides detailed diagnostic information.

## When to Use

Use this skill when:
- Creating new levels
- Testing existing levels
- Debugging unsolvable levels
- Validating level difficulty
- Checking if mirrors can reach light beams
- Verifying initial mirror positions

## Analysis Features

### 1. Mirror-Beam Collision Detection
- Checks if each mirror can be reached by the light beam
- Identifies mirrors that are out of reach
- Reports which mirrors are not contacted by any ray segment

### 2. Initial Mirror Position Validation
- Verifies mirrors are positioned to intercept the beam
- Checks mirror alignment with emitter and targets
- Reports misaligned or unreachable mirrors

### 3. Target Accessibility Analysis
- Determines which targets can be hit
- Identifies blocked targets
- Checks if all required targets are reachable

### 4. Obstacle Impact Assessment
- Analyzes how obstacles block light paths
- Reports which targets are blocked by obstacles
- Suggests alternative mirror angles

### 5. Difficulty Assessment
- Single mirror levels (1-5)
- Double mirror levels (6-10)
- Levels with obstacles (11-15)
- Multi-target levels (16-20)

## Usage

### Basic Level Check
```typescript
import { levels } from './levels';
import { analyzeLevelSolvability } from './analyzeLevelSolvability';

const level = levels[0];
const result = analyzeLevelSolvability(level);

console.log(result.isSolvable);
console.log(result.issues);
```

### Full Analysis Report
```typescript
import { verifyLevelCompleteness } from './analyzeLevelSolvability';

const level = levels[0];
const report = verifyLevelCompleteness(level);

console.log('Mirrors Analysis:', report.mirrorsAnalysis);
console.log('Targets Analysis:', report.targetsAnalysis);
console.log('Obstacles Analysis:', report.obstaclesAnalysis);
console.log('Suggestions:', report.suggestions);
```

## Implementation

Create `src/levels/analyzeLevelSolvability.ts` with these functions:

### analyzeLevelSolvability(level: Level)
Returns:
- `isSolvable`: boolean
- `mirrorsCanBeReached`: string[] (mirror IDs)
- `mirrorsCannotBeReached`: string[] (mirror IDs)
- `reachableTargets`: string[] (target IDs)
- `blockedTargets`: string[] (target IDs)
- `issues`: string[] (detailed issues)

### verifyLevelCompleteness(level: Level)
Returns detailed report with:
- `mirrorsAnalysis`: detailed mirror reachability
- `targetsAnalysis`: target accessibility report
- `obstaclesAnalysis`: obstacle impact analysis
- `suggestions`: array of improvement suggestions

### checkMirrorBeamCollision(level: Level)
Returns detailed collision info for each mirror.

## Common Issues and Solutions

### Issue: Mirror cannot be reached by beam
**Solution**: Adjust mirror x/y position to intersect with beam path

### Issue: Target blocked by obstacle
**Solution**: Add additional mirrors to route beam around obstacle

### Issue: Mirror angle doesn't reflect to target
**Solution**: Calculate optimal angle using reflection math

### Issue: Multiple targets require complex routing
**Solution**: Plan sequential reflections through multiple mirrors

## Code Examples

### Calculate Reflection Angle
```typescript
function calculateReflectionAngle(
  beamAngle: number,
  mirrorAngle: number
): number {
  // Beam reflects off mirror at complementary angle
  return 2 * mirrorAngle - beamAngle;
}
```

### Check Mirror-Reachability
```typescript
function isMirrorReachedByBeam(
  mirror: Mirror,
  raySegments: RaySegment[]
): boolean {
  return raySegments.some(segment =>
    lineIntersectsSegment(
      { x: mirror.x, y: mirror.y },
      mirror.length,
      mirror.angle,
      segment
    )
  );
}
```

## Testing

Run verification:
```bash
npm run verify-levels
```

Test specific level:
```bash
npm run test-level <level-id>
```

## Best Practices

1. Always verify new levels are solvable before committing
2. Test edge cases (obstacles, multiple reflections)
3. Ensure mirrors are reachable at initial position
4. Validate multi-target levels have achievable solution paths
5. Check that obstacles don't make levels impossible