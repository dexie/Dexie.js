import sourcemaps from 'rollup-plugin-sourcemaps';
import nodeResolve from 'rollup-plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';

const ERRORS_TO_IGNORE = [
  "THIS_IS_UNDEFINED",
  "UNUSED_EXTERNAL_IMPORT"
];

export default {
  entry: "tmp/dexie-observable.js",
  targets: [{
    dest: "dist/dexie-observable.js",
    format: "umd"
  }],
  sourceMap: true,
  moduleName: "dexieObservable",
  globals: { dexie: 'Dexie' },
  external: ["dexie"],
  plugins: [
    sourcemaps(),
    nodeResolve({ module: true, jsnext: true, browser: true, ignoreGlobal: false }),
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