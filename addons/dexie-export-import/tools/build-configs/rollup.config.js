import sourcemaps from 'rollup-plugin-sourcemaps';
import {readFileSync} from 'fs';
import path from 'path';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

const version = require(path.resolve(__dirname, '../../package.json')).version;

const ERRORS_TO_IGNORE = [
  "THIS_IS_UNDEFINED",
  "UNRESOLVED_IMPORT", // 'stream' is imported by clarinet
  "MISSING_GLOBAL_NAME", // global name "stream" (also clarinet)
  "MISSING_NODE_BUILTINS" // "stream" (also clarinet)
];

export default {
  input: 'tools/tmp/src/dexie-export-import.js',
  output: [{
    file: 'dist/dexie-export-import.js',
    format: 'umd',
    banner: readFileSync(path.resolve(__dirname, 'banner.txt'))+""
        .replace(/{version}/g, version)
        .replace(/{date}/g, new Date().toDateString()),
    globals: {dexie: "Dexie"},
    name: 'DexieExportImport',
    sourcemap: true,
    exports: 'named'
  },{
    file: 'dist/dexie-export-import.mjs',
    format: 'es',
    banner: readFileSync(path.resolve(__dirname, 'banner.txt'))+""
        .replace(/{version}/g, version)
        .replace(/{date}/g, new Date().toDateString()),
    sourcemap: true
  }],
  external: ['dexie'],
  plugins: [
    sourcemaps(),
    nodeResolve({browser: true}),
    commonjs()
  ],
  onwarn ({loc, frame, code, message}) {
    if (ERRORS_TO_IGNORE.includes(code)) return;
    if ( loc ) {
      console.warn( `${loc.file} (${loc.line}:${loc.column}) ${message}` );
      if ( frame ) console.warn( frame );
    } else {
      console.warn(`${code} ${message}`);
    }    
  }
};
