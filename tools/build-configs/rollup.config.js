import sourcemaps from 'rollup-plugin-sourcemaps';
import nodeResolve from 'rollup-plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';

import {readFileSync} from 'fs';
import path from 'path';

const version = require(path.resolve(__dirname, '../../package.json')).version;

const ERRORS_TO_IGNORE = [
  "CIRCULAR_DEPENDENCY" // Circular imports are OK. See https://github.com/rollup/rollup/issues/2271
];

export default {
  input: path.resolve(__dirname, '../../tools/tmp/src/index.js'),
  output: [{
    file: path.resolve(__dirname, '../../dist/dexie.js'),
    format: 'umd',
    name: 'Dexie',
    globals: {}, // For tests, use "QUnit". For addons, use "Dexie"
    sourcemap: true,
    banner: readFileSync(path.resolve(__dirname, 'banner.txt'))+""
      .replace(/{version}/g, version)
      .replace(/{date}/g, new Date().toDateString()),
  },{
    file: path.resolve(__dirname, '../../dist/dexie.mjs'),
    format: 'es',
    sourcemap: true,
    banner: readFileSync(path.resolve(__dirname, 'banner.txt'))+""
      .replace(/{version}/g, version)
      .replace(/{date}/g, new Date().toDateString()),
  }],
  plugins: [
    sourcemaps(),
    nodeResolve({module: true, jsnext: true, browser: true, ignoreGlobal: false}),
    cleanup()
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
