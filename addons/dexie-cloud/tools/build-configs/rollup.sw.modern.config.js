// @ts-check
import sourcemaps from 'rollup-plugin-sourcemaps';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';

const ERRORS_TO_IGNORE = [
  "THIS_IS_UNDEFINED",
];

export default {
  input: 'tools/tmp/modern/service-worker.js',
  output: [{
    file: 'dist/modern/service-worker.js',
    format: 'es',
    sourcemap: true
  },{
    file: 'dist/umd/service-worker.js',
    format: 'umd',
    globals: {
      dexie: 'Dexie',
      rxjs: 'rxjs'
    },
    name: 'DexieCloudSW',
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
