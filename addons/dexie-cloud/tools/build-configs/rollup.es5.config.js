// @ts-check
import sourcemaps from 'rollup-plugin-sourcemaps';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';

const ERRORS_TO_IGNORE = ['THIS_IS_UNDEFINED'];

export default {
  input: 'tools/tmp/es5/dexie-cloud-addon.js',
  output: [
    {
      file: 'dist/umd/dexie-cloud-addon.js',
      format: 'umd',
      globals: {
        dexie: 'Dexie',
        rxjs: 'rxjs'
      },
      name: 'DexieCloud',
      sourcemap: true,
      exports: 'named'
    },
    {
      file: 'dist/module-es5/dexie-cloud-addon.js',
      format: 'es',
      sourcemap: true
    }
  ],
  external: ['dexie', 'rxjs'],
  plugins: [
    sourcemaps(),
    nodeResolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs()
  ],
  onwarn({ loc, frame, code, message }) {
    if (ERRORS_TO_IGNORE.includes(code)) return;
    if (loc) {
      console.warn(`${loc.file} (${loc.line}:${loc.column}) ${message}`);
      if (frame) console.warn(frame);
    } else {
      console.warn(`${code} ${message}`);
    }
  }
};
