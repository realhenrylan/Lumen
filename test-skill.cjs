import { levels } from './src/levels/index.ts';
import {
  analyzeLevelSolvability,
  verifyLevelCompleteness,
  checkMirrorBeamCollision
} from './src/levels/analyzeLevelSolvability.ts';

console.log('=== Level Solver Checker - Test ===\n');

console.log('Available functions:');
console.log('- analyzeLevelSolvability(level)');
console.log('- verifyLevelCompleteness(level)');
console.log('- checkMirrorBeamCollision(level)');
console.log('\nAvailable levels:', levels.length);

if (levels.length > 0) {
  console.log('\nTesting with Level 1...\n');

  const level1 = levels[0];
  console.log('Level 1 configuration:');
  console.log(`  Emitter: (${level1.emitter.x}, ${level1.emitter.y}) at ${level1.emitter.angle}°`);
  console.log(`  Mirrors: ${level1.mirrors.length}`);
  level1.mirrors.forEach(m => {
    console.log(`    - ${m.id}: (${m.x}, ${m.y}) length=${m.length} angle=${m.angle}`);
  });
  console.log(`  Targets: ${level1.targets.length}`);
  level1.targets.forEach(t => {
    console.log(`    - ${t.id}: (${t.x}, ${t.y}) r=${t.r}`);
  });

  console.log('\n--- Analyzing Level 1 ---\n');

  const result = analyzeLevelSolvability(level1);
  console.log('Solvability Analysis:');
  console.log(`  Is Solvable: ${result.isSolvable ? '✓ YES' : '✗ NO'}`);
  console.log(`  Confidence: ${result.confidence}%`);
  console.log(`  Mirrors Can Be Reached: ${result.mirrorsCanBeReached.join(', ') || 'None'}`);
  console.log(`  Mirrors Cannot Be Reached: ${result.mirrorsCannotBeReached.join(', ') || 'None'}`);
  console.log(`  Reachable Targets: ${result.reachableTargets.join(', ') || 'None'}`);
  console.log(`  Blocked Targets: ${result.blockedTargets.join(', ') || 'None'}`);

  if (result.issues.length > 0) {
    console.log('\nIssues:');
    result.issues.forEach(issue => {
      console.log(`  - ${issue}`);
    });
  }

  console.log('\n--- Mirror-Beam Collision Details ---\n');

  const collision = checkMirrorBeamCollision(level1);
  collision.mirrors.forEach(mirror => {
    console.log(`Mirror ${mirror.mirrorId}:`);
    console.log(`  Position: (${mirror.mirrorPosition.x}, ${mirror.mirrorPosition.y})`);
    console.log(`  Angle: ${mirror.mirrorAngle}°`);
    console.log(`  Beam Collisions: ${mirror.beamCollisions}`);
    console.log(`  Is Reachable: ${mirror.isReachable ? '✓' : '✗'}`);
  });

  if (levels.length > 10) {
    console.log('\n--- Analyzing Level 11 (with obstacles) ---\n');

    const level11 = levels[10];
    const result11 = analyzeLevelSolvability(level11);

    console.log('Level 11 configuration:');
    console.log(`  Emitter: (${level11.emitter.x}, ${level11.emitter.y}) at ${level11.emitter.angle}°`);
    console.log(`  Mirrors: ${level11.mirrors.length}`);
    console.log(`  Targets: ${level11.targets.length}`);
    console.log(`  Obstacles: ${level11.obstacles.length}`);

    console.log('\nSolvability Analysis:');
    console.log(`  Is Solvable: ${result11.isSolvable ? '✓ YES' : '✗ NO'}`);
    console.log(`  Confidence: ${result11.confidence}%`);
    console.log(`  Mirrors Can Be Reached: ${result11.mirrorsCanBeReached.join(', ') || 'None'}`);
    console.log(`  Mirrors Cannot Be Reached: ${result11.mirrorsCannotBeReached.join(', ') || 'None'}`);
    console.log(`  Reachable Targets: ${result11.reachableTargets.join(', ') || 'None'}`);
    console.log(`  Blocked Targets: ${result11.blockedTargets.join(', ') || 'None'}`);

    if (result11.issues.length > 0) {
      console.log('\nIssues:');
      result11.issues.forEach(issue => {
        console.log(`  - ${issue}`);
      });
    }
  }

  console.log('\n=== Test Complete ===');
}
