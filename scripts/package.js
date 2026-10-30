/**
 * scripts/package.js
 * Builds optimized zip packages for Chrome Web Store, Firefox Add-ons (AMO),
 * Microsoft Edge Add-ons, and Universal installation, plus SHA256 checksums.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

console.log('📦 Starting Extension Packaging...\n');

// 1. Ensure dist directory exists and is clean
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

// Read base manifest
const manifestPath = path.join(ROOT_DIR, 'manifest.json');
const manifestRaw = fs.readFileSync(manifestPath, 'utf8');
const manifest = JSON.parse(manifestRaw);

console.log(`📌 Packaging Version: v${manifest.version}`);

// Files & folders to copy to packages
const COMMON_ITEMS = [
  'content.js',
  'icons',
  'popup',
  'LICENSE',
  'README.md'
];

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function createZipFromDir(sourceDir, zipFilePath) {
  const zipScript = path.join(ROOT_DIR, 'scripts', 'zip_dir.py');
  const cmd = `python "${zipScript}" "${sourceDir}" "${zipFilePath}"`;
  execSync(cmd, { stdio: 'inherit' });
}

function buildTarget(targetName, manifestModifier, zipName) {
  const stagingDir = path.join(DIST_DIR, `.staging-${targetName}`);
  fs.mkdirSync(stagingDir, { recursive: true });

  // Copy common items
  for (const item of COMMON_ITEMS) {
    const src = path.join(ROOT_DIR, item);
    if (fs.existsSync(src)) {
      copyRecursive(src, path.join(stagingDir, item));
    }
  }

  // Create customized manifest
  const modifiedManifest = manifestModifier(JSON.parse(JSON.stringify(manifest)));
  fs.writeFileSync(
    path.join(stagingDir, 'manifest.json'),
    JSON.stringify(modifiedManifest, null, 2),
    'utf8'
  );

  const zipPath = path.join(DIST_DIR, zipName);
  createZipFromDir(stagingDir, zipPath);

  // Clean staging
  fs.rmSync(stagingDir, { recursive: true, force: true });
  return zipPath;
}

// Target 1: Chrome Web Store (strip browser_specific_settings for clean CWS submission)
const chromeZip = buildTarget(
  'chrome',
  (m) => {
    delete m.browser_specific_settings;
    return m;
  },
  `universal-router-hub-chrome-v${manifest.version}.zip`
);

// Target 2: Firefox AMO (keep browser_specific_settings.gecko)
const firefoxZip = buildTarget(
  'firefox',
  (m) => {
    if (!m.browser_specific_settings || !m.browser_specific_settings.gecko) {
      m.browser_specific_settings = {
        gecko: {
          id: "universal-router-hub@egypt.net",
          strict_min_version: "109.0"
        }
      };
    }
    return m;
  },
  `universal-router-hub-firefox-v${manifest.version}.zip`
);

// Target 3: Microsoft Edge Add-ons
const edgeZip = buildTarget(
  'edge',
  (m) => {
    delete m.browser_specific_settings;
    return m;
  },
  `universal-router-hub-edge-v${manifest.version}.zip`
);

// Target 4: Universal Package (also copy as default universal-router-hub.zip on Desktop)
const universalZip = buildTarget(
  'universal',
  (m) => m,
  `universal-router-hub-v${manifest.version}.zip`
);

// Also copy default to root & desktop for instant manual use
fs.copyFileSync(universalZip, path.join(DIST_DIR, 'universal-router-hub.zip'));
fs.copyFileSync(universalZip, path.join(ROOT_DIR, '..', 'universal-router-hub.zip'));

// 2. Generate SHA256SUMS.txt
console.log('\n🔒 Calculating SHA256 Checksums...');
let checksums = '';
const generatedFiles = fs.readdirSync(DIST_DIR).filter(f => f.endsWith('.zip'));

for (const file of generatedFiles) {
  const filePath = path.join(DIST_DIR, file);
  const data = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  checksums += `${hash}  ${file}\n`;
  console.log(`  ${hash.slice(0, 16)}...  ${file}`);
}

fs.writeFileSync(path.join(DIST_DIR, 'SHA256SUMS.txt'), checksums, 'utf8');
console.log('✅ Generated: dist/SHA256SUMS.txt');

console.log('\n----------------------------------------');
console.log(`🎉 All packages successfully created in: ${DIST_DIR}`);
