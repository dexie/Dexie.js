import sourcemaps from 'rollup-plugin-sourcemaps';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import path from 'path';

const ERRORS_TO_IGNORE = [
  "THIS_IS_UNDEFINED",
  "CIRCULAR_DEPENDENCY" // Circular imports are OK. See https://github.com/rollup/rollup/issues/2271
];

export default {
  input: path.resolve(__dirname, '../tmp/test/tests-all.js'),
  output: {
    file: path.resolve(__dirname, '../../test/bundle.js'),
    format: 'umd',
    sourcemap: true,
    name: 'dexieTests',
    globals: {dexie: "Dexie", QUnit: "QUnit"},
  },
  external: (id) => {
    // Only treat 'dexie' and 'QUnit' as external, not subpaths like 'dexie/next'
    return id === 'dexie' || id === 'QUnit';
  },
  plugins: [
    // Custom resolver for dexie/next
    {
      name: 'resolve-dexie-next',
      resolveId(source, importer) {
        if (source === 'dexie/next') {
          return path.resolve(__dirname, '../tmp/src/next/index.mjs');
        }
        // Resolve '../..' imports from next modules back to main dexie (external)
        if (source === '../..' && importer && importer.includes('/next/')) {
          return { id: 'dexie', external: true };
        }
        return null; // Let other plugins handle it
      }
    },
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
