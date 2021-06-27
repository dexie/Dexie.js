// @ts-check
import sourcemaps from 'rollup-plugin-sourcemaps';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import {readFileSync} from 'fs';
import path from 'path';

const ERRORS_TO_IGNORE = [
  "THIS_IS_UNDEFINED",
];

export default {
  input: 'tools/tmp/modern/dexie-cloud-client.js',
  output: [{
    file: 'dist/modern/dexie-cloud-addon.js',
    format: 'es',
    banner: readFileSync(path.resolve(__dirname, 'banner.txt'), "utf-8"),
    sourcemap: true
  }, {
    file: 'dist/umd-modern/dexie-cloud-addon.js',
    format: 'umd',
    globals: {
      dexie: 'Dexie',
      rxjs: 'rxjs'
    },
    name: 'DexieCloud',
    banner: readFileSync(path.resolve(__dirname, 'banner.txt'), "utf-8"),
    sourcemap: true,
    exports: 'named'
  }],
  external: ['dexie', 'rxjs'],
  plugins: [
    sourcemaps(),
    nodeResolve({
      browser: true,
      preferBuiltins: false
    }),
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
