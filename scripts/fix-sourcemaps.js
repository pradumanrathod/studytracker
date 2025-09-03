// Creates a minimal sourcemap for coco-ssd to silence missing .map warnings in dev tools.
// It does not affect runtime code; only prevents 404 warnings for the map file.

const fs = require('fs');
const path = require('path');

const mapPath = path.join(__dirname, '..', 'node_modules', '@tensorflow-models', 'coco-ssd', 'dist', 'coco-ssd.es2017.esm.min.js.map');

function ensureDirExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

try {
  ensureDirExists(mapPath);
  if (!fs.existsSync(mapPath)) {
    const minimalMap = {
      version: 3,
      file: 'coco-ssd.es2017.esm.min.js',
      sources: [],
      names: [],
      mappings: ''
    };
    fs.writeFileSync(mapPath, JSON.stringify(minimalMap));
    console.log('Created missing sourcemap:', mapPath);
  } else {
    console.log('Sourcemap already exists:', mapPath);
  }
} catch (err) {
  console.error('Failed to create coco-ssd sourcemap:', err);
  process.exitCode = 0; // do not fail install
}
