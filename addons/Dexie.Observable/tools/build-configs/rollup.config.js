import sourcemaps from 'rollup-plugin-sourcemaps';
import {readFileSync} from 'fs';
import path from 'path';

const version = require(path.resolve(__dirname, '../../package.json')).version;

export default {
  input: 'tools/tmp/es5/src/Dexie.Observable.js',
  output: [{
    file: 'dist/dexie-observable.js',
    format: 'umd',
    banner: readFileSync(path.resolve(__dirname, 'banner.txt'))+""
        .replace(/{version}/g, version)
        .replace(/{date}/g, new Date().toDateString()),
    globals: {dexie: "Dexie"},
    name: 'Dexie.Observable',
    sourcemap: true
  },{
    file: 'dist/dexie-observable.es.js',
    format: 'es',
    banner: readFileSync(path.resolve(__dirname, 'banner.txt'))+""
        .replace(/{version}/g, version)
        .replace(/{date}/g, new Date().toDateString()),
    globals: {dexie: "Dexie"},
    name: 'Dexie.Observable',
    sourcemap: true
  }],
  external: ['dexie'],
  plugins: [ sourcemaps() ]
};
