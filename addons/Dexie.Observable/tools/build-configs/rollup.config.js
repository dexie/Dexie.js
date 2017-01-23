import sourcemaps from 'rollup-plugin-sourcemaps';
import {readFileSync} from 'fs';
import path from 'path';

const version = require(path.resolve(__dirname, '../../package.json')).version;

export default {
  entry: 'tmp/es5/src/Dexie.Observable.js',
  dest: 'dist/dexie-observable.js',
  format: 'umd',
  sourceMap: true,
  banner: readFileSync(path.resolve(__dirname, 'banner.txt'))+""
    .replace(/{version}/g, version)
    .replace(/{date}/g, new Date().toDateString()),
  moduleName: 'Dexie.Observable',
  globals: {dexie: "Dexie"},
  external: ['dexie'],
  plugins: [ sourcemaps() ]
};
