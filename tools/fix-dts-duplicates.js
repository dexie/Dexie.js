#!/usr/bin/env node
// Post-process the generated dexie.d.ts to remove duplicate module declarations

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node fix-dts-duplicates.js <path-to-dts-file>');
  process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

// Find all "export declare module Dexie {" blocks
let moduleStarts = [];
let moduleEnds = [];

for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim().startsWith('export declare module Dexie {')) {
    moduleStarts.push(i);
  }
}

// Find the end of each module (closing brace)
for (let start of moduleStarts) {
  let braceCount = 0;
  for (let i = start; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('{')) braceCount += (line.match(/\{/g) || []).length;
    if (line.includes('}')) braceCount -= (line.match(/\}/g) || []).length;
    if (braceCount === 0 && i > start) {
      moduleEnds.push(i);
      break;
    }
  }
}

// If we have duplicates, remove all but the first
if (moduleStarts.length > 1) {
  console.log(`Found ${moduleStarts.length} duplicate module declarations. Removing duplicates...`);
  
  // Remove duplicates in reverse order to preserve line numbers
  for (let i = moduleStarts.length - 1; i >= 1; i--) {
    const start = moduleStarts[i];
    // Find the start of the comment block before this duplicate
    let commentStart = start;
    while (commentStart > 0 && (lines[commentStart - 1].trim().startsWith('//') || lines[commentStart - 1].trim() === '')) {
      commentStart--;
    }
    
    const end = moduleEnds[i];
    lines.splice(commentStart, end - commentStart + 1);
  }
  
  content = lines.join('\n');
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('Fixed duplicate module declarations');
} else {
  console.log('No duplicate module declarations found');
}
