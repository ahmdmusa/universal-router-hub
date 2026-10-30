/**
 * scripts/bump-version.js
 * Increments version in manifest.json and package.json (patch, minor, major, or explicit version).
 * Usage:
 *   node scripts/bump-version.js patch
 *   node scripts/bump-version.js minor
 *   node scripts/bump-version.js major
 *   node scripts/bump-version.js 1.2.0
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const arg = process.argv[2] || 'patch';

const manifestPath = path.join(ROOT_DIR, 'manifest.json');
const packagePath = path.join(ROOT_DIR, 'package.json');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

const currentVer = manifest.version;
const parts = currentVer.split('.').map(Number);

let newVer = '';
if (arg === 'patch') {
  parts[2] = (parts[2] || 0) + 1;
  newVer = parts.join('.');
} else if (arg === 'minor') {
  parts[1] = (parts[1] || 0) + 1;
  parts[2] = 0;
  newVer = parts.join('.');
} else if (arg === 'major') {
  parts[0] = (parts[0] || 0) + 1;
  parts[1] = 0;
  parts[2] = 0;
  newVer = parts.join('.');
} else if (/^\d+\.\d+\.\d+$/.test(arg)) {
  newVer = arg;
} else {
  console.error(`❌ Invalid version argument: ${arg}. Use patch, minor, major, or X.Y.Z`);
  process.exit(1);
}

manifest.version = newVer;
pkg.version = newVer;

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

console.log(`🚀 Version bumped: v${currentVer} -> v${newVer}`);
console.log(`Updated manifest.json and package.json`);
