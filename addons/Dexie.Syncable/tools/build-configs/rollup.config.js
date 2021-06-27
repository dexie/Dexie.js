import sourcemaps from 'rollup-plugin-sourcemaps';
import {readFileSync} from 'fs';
import path from 'path';

const version = require(path.resolve(__dirname, '../../package.json')).version;

export default {
  input: 'tools/tmp/es5/addons/Dexie.Syncable/src/Dexie.Syncable.js',
  output: [{
    file: 'dist/dexie-syncable.js',
    format: 'umd',
    banner: readFileSync(path.resolve(__dirname, 'banner.txt')),
    globals: {dexie: "Dexie", "dexie-observable": "Dexie.Observable"},
    name: "Dexie.Syncable",
  },{
    file: 'dist/dexie-syncable.es.js',
    format: 'es',
    banner: readFileSync(path.resolve(__dirname, 'banner.txt')),
    globals: {dexie: "Dexie", "dexie-observable": "Dexie.Observable"},
    name: "Dexie.Syncable",
  }],
  external: ['dexie', 'dexie-observable'],
  plugins: [ sourcemaps() ]
};
