const fs = require('fs');
const path = require('path');

// Build script to copy next modules from tools/tmp/src/next to dist/next
// This ensures we have plain ESM modules with .js, .js.map and .d.ts files

const sourceDir = path.join(__dirname, '../tools/tmp/src/next');
const targetDir = path.join(__dirname, '../dist/next');

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
} else {
  // Clean target directory before copying
  const existingFiles = fs.readdirSync(targetDir);
  existingFiles.forEach(file => {
    fs.unlinkSync(path.join(targetDir, file));
  });
}

// Copy all .mjs, .mjs.map and .d.mts files
if (fs.existsSync(sourceDir)) {
  const files = fs.readdirSync(sourceDir);
  
  files.forEach(file => {
    const ext = path.extname(file);
    if (ext === '.mjs' || ext === '.mts' || (ext === '.map' && file.endsWith('.mjs.map'))) {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);
      
      if (fs.statSync(sourcePath).isFile()) {
        let content = fs.readFileSync(sourcePath, 'utf8');
        
        // Replace imports from '../..' in .mjs and .d.mts files
        if (ext === '.mjs') {
          content = content.replace(/from ['"]\.\.\/\.\.['"]/g, "from '../dexie.mjs'");
        } else if (ext === '.mts') {
          content = content.replace(/from ['"]\.\.\/\.\.['"]/g, "from '../dexie.js'");
        }
        
        fs.writeFileSync(targetPath, content, 'utf8');
        console.log(`Copied: ${file}`);
      }
    }
  });
  
  console.log('✓ Next modules built successfully');
} else {
  console.error('Source directory does not exist:', sourceDir);
  process.exit(1);
}
