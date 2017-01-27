import sourcemaps from 'rollup-plugin-sourcemaps';
import {readFileSync} from 'fs';
import path from 'path';

// This build-config is not yet used. Will be if Dexie.Syncable will use typescript

const version = require(path.resolve(__dirname, '../../package.json')).version;

export default {
  entry: 'tools/tmp/es6/addons/Dexie.Syncable/src/Dexie.Syncable.js',
  dest: 'dist/dexie-syncable.es6.js',
  format: 'es',
  sourceMap: true,
  banner: readFileSync(path.resolve(__dirname, 'banner.txt'))+""
    .replace(/{version}/g, version)
    .replace(/{date}/g, new Date().toDateString()),
  plugins: [ sourcemaps() ]
};
