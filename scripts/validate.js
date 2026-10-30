/**
 * scripts/validate.js
 * Validates manifest.json, declared icons, and JavaScript syntax.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');

console.log('🔍 Starting Extension Validation...\n');

let hasErrors = false;

// 1. Validate manifest.json
const manifestPath = path.join(ROOT_DIR, 'manifest.json');
let manifest = null;

try {
  const content = fs.readFileSync(manifestPath, 'utf8');
  manifest = JSON.parse(content);
  console.log('✅ manifest.json: Valid JSON');
} catch (err) {
  console.error('❌ manifest.json: Invalid JSON or file missing!', err.message);
  hasErrors = true;
}

if (manifest) {
  // Required fields
  const required = ['manifest_version', 'name', 'version', 'description', 'icons'];
  for (const field of required) {
    if (!manifest[field]) {
      console.error(`❌ manifest.json: Missing required field "${field}"`);
      hasErrors = true;
    }
  }

  if (manifest.manifest_version !== 3) {
    console.error(`❌ manifest.json: manifest_version must be 3, got ${manifest.manifest_version}`);
    hasErrors = true;
  } else {
    console.log(`✅ Manifest Version: ${manifest.manifest_version} (MV3 compliant)`);
    console.log(`✅ Extension Name: "${manifest.name}" v${manifest.version}`);
  }

  // Check declared icons
  if (manifest.icons && typeof manifest.icons === 'object') {
    for (const [size, relPath] of Object.entries(manifest.icons)) {
      const fullPath = path.join(ROOT_DIR, relPath);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        if (stats.size > 0) {
          console.log(`✅ Icon (${size}px): ${relPath} (${stats.size} bytes)`);
        } else {
          console.error(`❌ Icon (${size}px): ${relPath} is empty!`);
          hasErrors = true;
        }
      } else {
        console.error(`❌ Icon (${size}px): File not found at ${fullPath}`);
        hasErrors = true;
      }
    }
  }

  // Check content scripts
  if (Array.isArray(manifest.content_scripts)) {
    for (const cs of manifest.content_scripts) {
      if (cs.js) {
        for (const jsFile of cs.js) {
          const jsPath = path.join(ROOT_DIR, jsFile);
          if (!fs.existsSync(jsPath)) {
            console.error(`❌ Content script missing: ${jsFile}`);
            hasErrors = true;
          }
        }
      }
    }
  }

  // Check popup files
  if (manifest.action && manifest.action.default_popup) {
    const popupHtml = path.join(ROOT_DIR, manifest.action.default_popup);
    if (!fs.existsSync(popupHtml)) {
      console.error(`❌ Popup HTML missing: ${manifest.action.default_popup}`);
      hasErrors = true;
    } else {
      console.log(`✅ Popup UI: ${manifest.action.default_popup} exists`);
    }
  }
}

// 2. Validate JS Syntax
const jsFilesToCheck = ['content.js', 'popup/popup.js'];
for (const relFile of jsFilesToCheck) {
  const filePath = path.join(ROOT_DIR, relFile);
  if (fs.existsSync(filePath)) {
    try {
      execSync(`node -c "${filePath}"`, { stdio: 'pipe' });
      console.log(`✅ Syntax OK: ${relFile}`);
    } catch (err) {
      console.error(`❌ Syntax Error in ${relFile}:`);
      console.error(err.stderr.toString());
      hasErrors = true;
    }
  }
}

console.log('\n----------------------------------------');
if (hasErrors) {
  console.error('❌ Validation FAILED. Please fix the above errors before packaging.\n');
  process.exit(1);
} else {
  console.log('🎉 Validation PASSED! All extension assets are verified.\n');
  process.exit(0);
}
