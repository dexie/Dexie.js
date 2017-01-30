import sourcemaps from 'rollup-plugin-sourcemaps';
import {readFileSync} from 'fs';
import path from 'path';

const version = require(path.resolve(__dirname, '../../package.json')).version;

export default {
  entry: 'tools/tmp/es5/src/Dexie.js',
  targets: [{
    dest: 'dist/dexie.js',
    format: 'umd',
  },{
    dest: 'dist/dexie.es.js',
    format: 'es'
  }],
  sourceMap: true,
  banner: readFileSync(path.resolve(__dirname, 'banner.txt'))+""
    .replace(/{version}/g, version)
    .replace(/{date}/g, new Date().toDateString()),
  moduleName: 'Dexie',
  globals: {}, // For tests, use "QUnit". For addons, use "Dexie"
  plugins: [ sourcemaps() ]
};
