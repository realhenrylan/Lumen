const { levels } = require('./dist/levels/index.js');
const {
  analyzeLevelSolvability,
  verifyLevelCompleteness,
  checkMirrorBeamCollision
} = require('./dist/levels/analyzeLevelSolvability.js');

function displayResults(levelId) {
  const level = levels.find(l => l.id === levelId);

  if (!level) {
    console.log(`Level ${levelId} not found`);
    return;
  }

  console.log(`\n=== Level ${level.id} Analysis ===\n`);

  const solvability = analyzeLevelSolvability(level);
  console.log(`Solvability: ${solvability.isSolvable ? '✓ SOLVABLE' : '✗ UNSOLVABLE'}`);
  console.log(`Confidence: ${solvability.confidence}%`);

  console.log(`\nMirrors:`);
  console.log(`  Can be reached: ${solvability.mirrorsCanBeReached.join(', ') || 'None'}`);
  if (solvability.mirrorsCannotBeReached.length > 0) {
    console.log(`  Cannot be reached: ${solvability.mirrorsCannotBeReached.join(', ')}`);
  }

  console.log(`\nTargets:`);
  console.log(`  Reachable: ${solvability.reachableTargets.join(', ') || 'None'}`);
  if (solvability.blockedTargets.length > 0) {
    console.log(`  Blocked: ${solvability.blockedTargets.join(', ')}`);
  }

  if (solvability.issues.length > 0) {
    console.log(`\nIssues:`);
    solvability.issues.forEach(issue => {
      console.log(`  - ${issue}`);
    });
  }

  const collisionInfo = checkMirrorBeamCollision(level);
  console.log(`\nMirror-Beam Collision Details:`);
  collisionInfo.mirrors.forEach(mirror => {
    console.log(`  Mirror ${mirror.mirrorId}:`);
    console.log(`    Position: (${mirror.mirrorPosition.x}, ${mirror.mirrorPosition.y})`);
    console.log(`    Angle: ${mirror.mirrorAngle}°`);
    console.log(`    Beam collisions: ${mirror.beamCollisions}`);
    console.log(`    Reachable: ${mirror.isReachable ? 'Yes' : 'No'}`);
  });
}

function analyzeAllLevels() {
  console.log('\n=== Analyzing All Levels ===\n');

  let solvable = 0;
  let unsolvable = 0;

  levels.forEach(level => {
    const result = analyzeLevelSolvability(level);
    const status = result.isSolvable ? '✓' : '✗';
    console.log(
      `${status} Level ${level.id.toString().padStart(2, '0')} - ${result.confidence}% confidence`
    );

    if (result.isSolvable) {
      solvable++;
    } else {
      unsolvable++;
    }
  });

  console.log(`\n=== Summary ===`);
  console.log(`Total: ${levels.length}`);
  console.log(`Solvable: ${solvable}`);
  console.log(`Unsolvable: ${unsolvable}`);

  if (unsolvable > 0) {
    console.log('\n⚠️  Warning: Some levels are not solvable');
    console.log('Run check-level.cjs with a level ID to see detailed analysis');
  }
}

const args = process.argv.slice(2);

if (args.length === 0) {
  analyzeAllLevels();
} else {
  const levelId = parseInt(args[0], 10);
  if (isNaN(levelId)) {
    console.log('Invalid level ID');
    process.exit(1);
  }
  displayResults(levelId);
}
