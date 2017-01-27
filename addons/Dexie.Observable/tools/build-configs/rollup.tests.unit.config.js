import sourcemaps from 'rollup-plugin-sourcemaps';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

const ERRORS_TO_IGNORE = [
  "THIS_IS_UNDEFINED"
];

export default {
  entry: 'tools/tmp/es5/test/addons/Dexie.Observable/test/unit/unit-tests-all.js',
  dest: 'test/unit/bundle.js',
  format: 'umd',
  sourceMap: true,
  moduleName: 'dexieTests',
  globals: {dexie: "Dexie", "dexie-observable": "Dexie.Observable", QUnit: "QUnit"},
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
