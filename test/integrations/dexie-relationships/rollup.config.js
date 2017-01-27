import sourcemaps from 'rollup-plugin-sourcemaps';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

const ERRORS_TO_IGNORE = [
  "THIS_IS_UNDEFINED"
];

export default {
  entry: 'tmp/es5/integrations/dexie-relationships/index.js',
  dest: 'dexie-relationships/test-bundle.js',
  format: 'umd',
  sourceMap: true,
  moduleName: 'dexieRelationshipsIntegrationTests',
  globals: {dexie: "Dexie", "dexie-relationships": "dexieRelationships", QUnit: "QUnit"},
  external: ['dexie', 'dexie-relationships', 'QUnit'],
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
