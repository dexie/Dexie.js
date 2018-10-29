import sourcemaps from 'rollup-plugin-sourcemaps';
import {readFileSync} from 'fs';
import path from 'path';

const version = require(path.resolve(__dirname, '../../package.json')).version;

export default {
  input: 'tools/tmp/dexie-export-import.js',
  output: [{
    file: 'dist/dexie-export-import.js',
    format: 'umd',
    banner: readFileSync(path.resolve(__dirname, 'banner.txt'))+""
        .replace(/{version}/g, version)
        .replace(/{date}/g, new Date().toDateString()),
    globals: {dexie: "Dexie"},
    name: 'Dexie.ExportImport',
    sourcemap: true
  },{
    file: 'dist/dexie-export-import.mjs',
    format: 'es',
    banner: readFileSync(path.resolve(__dirname, 'banner.txt'))+""
        .replace(/{version}/g, version)
        .replace(/{date}/g, new Date().toDateString()),
    globals: {dexie: "Dexie"},
    name: 'Dexie.ExportImport',
    sourcemap: true
  }],
  external: ['dexie'],
  plugins: [ sourcemaps() ]
};
