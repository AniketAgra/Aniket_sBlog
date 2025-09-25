// Copies the latest Vite client build (client/dist) into api/public
// Ensures stale hashed asset files are removed so Render (or any host) serves fresh build.
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const distDir = path.join(root, 'client', 'dist');
const targetDir = path.join(root, 'api', 'public');

if (!fs.existsSync(distDir)) {
  console.error('[syncClientBuild] Missing client/dist. Run `npm run build:client` first.');
  process.exit(1);
}

if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
const assetsSrc = path.join(distDir, 'assets');
const assetsDest = path.join(targetDir, 'assets');

// Remove old assets directory entirely to avoid orphaned hashed files
if (fs.existsSync(assetsDest)) {
  fs.rmSync(assetsDest, { recursive: true, force: true });
}

// Copy all top-level files from dist (index.html, etc.)
for (const entry of fs.readdirSync(distDir)) {
  const srcPath = path.join(distDir, entry);
  const destPath = path.join(targetDir, entry);
  const stat = fs.statSync(srcPath);
  if (stat.isDirectory()) {
    if (entry === 'assets') continue; // handle after loop
    // Copy generic directory recursively
    copyDir(srcPath, destPath);
  } else {
    fs.copyFileSync(srcPath, destPath);
  }
}

// Copy assets directory recursively
copyDir(assetsSrc, assetsDest);

console.log('[syncClientBuild] Synced client build to api/public successfully.');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const file of fs.readdirSync(src)) {
    const s = path.join(src, file);
    const d = path.join(dest, file);
    const stat = fs.statSync(s);
    if (stat.isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
  }
}
