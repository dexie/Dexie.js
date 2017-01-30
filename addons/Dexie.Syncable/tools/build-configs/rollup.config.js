import sourcemaps from 'rollup-plugin-sourcemaps';
import {readFileSync} from 'fs';
import path from 'path';

const version = require(path.resolve(__dirname, '../../package.json')).version;

export default {
  entry: 'tools/tmp/es5/addons/Dexie.Syncable/src/Dexie.Syncable.js',
  targets: [{
    dest: 'dist/dexie-syncable.js',
    format: 'umd',
  },{
    dest: 'dist/dexie-syncable.es.js',
    format: 'es'
  }],
  sourceMap: true,
  banner: readFileSync(path.resolve(__dirname, 'banner.txt'))+""
    .replace(/{version}/g, version)
    .replace(/{date}/g, new Date().toDateString()),
  moduleName: 'Dexie.Syncable',
  globals: {dexie: "Dexie", "dexie-observable": "Dexie.Observable"},
  external: ['dexie', 'dexie-observable'],
  plugins: [ sourcemaps() ]
};
