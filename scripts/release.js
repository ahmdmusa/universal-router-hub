/**
 * scripts/release.js
 * One-click release automation script.
 * Validates, packages, commits, tags, and pushes to trigger GitHub Actions deployment.
 * Usage:
 *   node scripts/release.js [patch|minor|major|vX.X.X]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const arg = process.argv[2];

function run(cmd, desc) {
  console.log(`\n▶ ${desc || cmd}`);
  execSync(cmd, { cwd: ROOT_DIR, stdio: 'inherit' });
}

console.log('🚀 Universal Router Hub - Release Automation\n');

// 1. Optionally bump version if argument provided
if (arg) {
  run(`node scripts/bump-version.js ${arg}`, `Bumping version (${arg})`);
}

// 2. Validate
run('node scripts/validate.js', 'Validating extension code and manifest');

// 3. Package
run('node scripts/package.js', 'Building distribution zip packages');

// Read current version
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'manifest.json'), 'utf8'));
const version = manifest.version;
const tag = `v${version}`;

console.log(`\n📌 Preparing Release for: ${tag}`);

try {
  // Check git status
  const status = execSync('git status --porcelain', { cwd: ROOT_DIR, encoding: 'utf8' }).trim();
  if (status) {
    run('git add -A', 'Staging modified files');
    run(`git commit -m "chore(release): ${tag} [skip ci]"`, `Committing release ${tag}`);
  } else {
    console.log('Working tree clean, proceeding to tag.');
  }

  // Check if tag already exists locally or remotely
  let tagExists = false;
  try {
    execSync(`git rev-parse ${tag}`, { cwd: ROOT_DIR, stdio: 'ignore' });
    tagExists = true;
  } catch (e) {
    tagExists = false;
  }

  if (tagExists) {
    console.log(`⚠️ Tag ${tag} already exists locally.`);
  } else {
    run(`git tag -a ${tag} -m "Release ${tag}"`, `Creating git tag ${tag}`);
  }

  console.log('\n⬆️ Pushing changes and tags to GitHub...');
  run('git push origin main', 'Pushing main branch');
  run(`git push origin ${tag}`, `Pushing tag ${tag}`);

  console.log('\n----------------------------------------');
  console.log(`🎉 Release ${tag} successfully initiated!`);
  console.log('🔗 GitHub Actions workflow has been triggered.');
  console.log('Visit: https://github.com/ahmdmusa/universal-router-hub/actions');
} catch (err) {
  console.error('\n❌ Release process encountered an error:', err.message);
  process.exit(1);
}
