import sourcemaps from 'rollup-plugin-sourcemaps';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonJs from 'rollup-plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';

const ERRORS_TO_IGNORE = [
  "THIS_IS_UNDEFINED",
  "UNUSED_EXTERNAL_IMPORT"
];

export default {
  input: "tmp/index.js",
  output: [{
    file: "dist/dexie-observable.js",
    format: "umd"
  }],
  sourcemap: true,
  name: "dexieObservable",
  globals: { dexie: 'Dexie', "rxjs/Observable": 'Rx.Observable' },
  external: ["dexie", "rxjs/Observable"],
  plugins: [
    sourcemaps(),
    nodeResolve({ module: true, jsnext: true, browser: true, ignoreGlobal: false }),
    commonJs(),
    cleanup()
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
}