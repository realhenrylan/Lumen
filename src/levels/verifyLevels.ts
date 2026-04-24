import { levels } from './index';
import { raycastLevel } from '../game/core/raycast';

interface VerificationResult {
  levelId: number;
  solvable: boolean;
  targetCount: number;
  hitTargetCount: number;
  message: string;
}

function verifyLevel(level: typeof levels[0]): VerificationResult {
  const result = raycastLevel(level);
  const hitCount = result.hitTargetIds.length;
  const targetCount = level.targets.length;
  const solvable = hitCount === targetCount;

  let message = '';
  if (solvable) {
    message = `✓ Level ${level.id}: All ${targetCount} targets hit`;
  } else {
    message = `✗ Level ${level.id}: Only ${hitCount}/${targetCount} targets hit`;
    if (hitCount === 0) {
      message += ' (Check emitter angle and mirror positions)';
    } else {
      const missedTargets = level.targets
        .filter(t => !result.hitTargetIds.includes(t.id))
        .map(t => t.id);
      message += ` (Missed: ${missedTargets.join(', ')})`;
    }
  }

  return {
    levelId: level.id,
    solvable,
    targetCount,
    hitTargetCount: hitCount,
    message,
  };
}

function analyzeDifficulty(): void {
  console.log('\n=== Level Difficulty Analysis ===\n');

  const categories = {
    single: [] as number[],
    double: [] as number[],
    obstacle: [] as number[],
    multiTarget: [] as number[],
  };

  levels.forEach(level => {
    if (level.targets.length === 1 && level.obstacles.length === 0) {
      categories.single.push(level.id);
    } else if (level.targets.length === 1 && level.obstacles.length > 0) {
      categories.obstacle.push(level.id);
    } else if (level.targets.length === 2) {
      categories.multiTarget.push(level.id);
    } else if (level.mirrors.length >= 2 && level.targets.length === 1) {
      categories.double.push(level.id);
    }
  });

  console.log('Single Mirror (Levels 1-5):', categories.single.join(', '));
  console.log('Double Mirrors (Levels 6-10):', categories.double.join(', '));
  console.log('With Obstacles (Levels 11-15):', categories.obstacle.join(', '));
  console.log('Multi-Target (Levels 16-20):', categories.multiTarget.join(', '));
}

export function verifyAllLevels(): void {
  console.log('=== Level Verification ===\n');

  const results: VerificationResult[] = [];
  let solvableCount = 0;
  let unsolvableCount = 0;

  levels.forEach(level => {
    const result = verifyLevel(level);
    results.push(result);
    console.log(result.message);
    if (result.solvable) {
      solvableCount++;
    } else {
      unsolvableCount++;
    }
  });

  console.log('\n=== Summary ===');
  console.log(`Total Levels: ${levels.length}`);
  console.log(`Solvable: ${solvableCount}`);
  console.log(`Unsolvable: ${unsolvableCount}`);

  if (unsolvableCount > 0) {
    console.log('\n⚠️  Warning: Some levels are not solvable with default configuration');
  }

  analyzeDifficulty();
}

if (typeof window === 'undefined') {
  verifyAllLevels();
}
