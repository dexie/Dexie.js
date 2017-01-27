import sourcemaps from 'rollup-plugin-sourcemaps';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

const ERRORS_TO_IGNORE = [
  "THIS_IS_UNDEFINED"
];

export default {
  entry: 'tools/tmp/es5/test/tests-all.js',
  dest: 'tools/tmp/es5/test/bundle.js',
  format: 'umd',
  sourceMap: true,
  moduleName: 'dexieTests',
  globals: {dexie: "Dexie", QUnit: "QUnit"},
  external: ['dexie', 'QUnit'],
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
