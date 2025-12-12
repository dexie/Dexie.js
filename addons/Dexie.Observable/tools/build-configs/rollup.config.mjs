import sourcemaps from 'rollup-plugin-sourcemaps';
import {readFileSync} from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(readFileSync(path.resolve(__dirname, '../../package.json'), 'utf-8'));
const version = packageJson.version;

export default {
  input: 'tools/tmp/es5/src/Dexie.Observable.js',
  output: [{
    file: 'dist/dexie-observable.js',
    format: 'umd',
    banner: readFileSync(path.resolve(__dirname, 'banner.txt')),
    globals: {dexie: "Dexie"},
    name: 'Dexie.Observable',
    sourcemap: true
  },{
    file: 'dist/dexie-observable.es.js',
    format: 'es',
    banner: readFileSync(path.resolve(__dirname, 'banner.txt')),
    globals: {dexie: "Dexie"},
    name: 'Dexie.Observable',
    sourcemap: true
  }],
  external: ['dexie'],
  plugins: [ sourcemaps() ]
};
