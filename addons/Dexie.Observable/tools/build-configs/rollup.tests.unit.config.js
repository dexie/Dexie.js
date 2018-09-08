import sourcemaps from 'rollup-plugin-sourcemaps';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

const ERRORS_TO_IGNORE = [
  "THIS_IS_UNDEFINED"
];

export default {
  input: 'tools/tmp/es5/test/addons/Dexie.Observable/test/unit/unit-tests-all.js',
  output: {
    file: 'test/unit/bundle.js',
    format: 'umd',
    globals: {dexie: "Dexie", "dexie-observable": "Dexie.Observable", QUnit: "QUnit"},
    sourcemap: true,
    name: 'dexieTests'
  },
  external: ['dexie', 'dexie-observable', 'QUnit'],
  plugins: [
    sourcemaps(),
    nodeResolve({browser: true}),
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
