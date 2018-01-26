import sourcemaps from 'rollup-plugin-sourcemaps';
import nodeResolve from 'rollup-plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';

import {readFileSync} from 'fs';
import path from 'path';

const version = require(path.resolve(__dirname, '../../package.json')).version;

export default {
  entry: path.resolve(__dirname, '../../tools/tmp/src/index.js'),
  targets: [{
    dest: path.resolve(__dirname, '../../dist/dexie.js'),
    format: 'umd',
  },{
    dest: path.resolve(__dirname, '../../dist/dexie.mjs'),
    format: 'es'
  }],
  sourceMap: true,
  banner: readFileSync(path.resolve(__dirname, 'banner.txt'))+""
    .replace(/{version}/g, version)
    .replace(/{date}/g, new Date().toDateString()),
  moduleName: 'Dexie',
  globals: {}, // For tests, use "QUnit". For addons, use "Dexie"
  plugins: [
    sourcemaps(),
    nodeResolve({module: true, jsnext: true, browser: true, ignoreGlobal: false}),
    cleanup()
  ],
};
