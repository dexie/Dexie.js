import sourcemaps from 'rollup-plugin-sourcemaps';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

const ERRORS_TO_IGNORE = [
  "THIS_IS_UNDEFINED"
];

export default {
  input: 'tools/tmp/test/index.js',
  output: [{
    file: 'test/bundle.js',
    format: 'umd',
    globals: {
      dexie: "Dexie",
      qunit: "QUnit",
      "dexie-export-import":
      "DexieExportImport"
    },
    name: 'DexieExportImport',
    sourcemap: true,
    exports: 'named'
  }],
  external: ['dexie', "qunit", "dexie-export-import"],
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
