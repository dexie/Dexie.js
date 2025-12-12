// @ts-check
//import sourcemaps from 'rollup-plugin-sourcemaps';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import { readFileSync, writeFileSync } from 'fs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
// @ts-ignore: requires tsconfig settings that we don't need for the web build but is ok here in the build config.
import pkg from '../../package.json' with { type: 'json' };
import * as fs from 'fs';

//const ERRORS_TO_IGNORE = ['THIS_IS_UNDEFINED'];

export function createBanner() {
  // Create a copy of banner.txt with version and date replaced.
  let banner = readFileSync('tools/build-configs/banner.txt', 'utf-8');
  banner = banner
    .replace(/{version}/g, pkg.version)
    .replace(/{date}/g, new Date().toDateString());
  fs.mkdirSync('tools/tmp', { recursive: true });
  writeFileSync('tools/tmp/banner.txt', banner, 'utf-8');
}

/**
 *
 * @param {String} entry such as src/y-dexie.ts
 * @param {String} outputName such as y-dexie
 * @returns
 */
export function createRollupConfig(entry, outputName) {
  return {
    input: entry,
    output: [
      {
        file: `dist/${outputName}.js`,
        format: 'es',
        banner: readFileSync('tools/tmp/banner.txt', 'utf-8'),
        sourcemap: true,
      },
      {
        file: `dist/${outputName}.min.js`,
        format: 'es',
        banner: readFileSync('tools/tmp/banner.txt', 'utf-8'),
        sourcemap: true,
        plugins: [
          terser({
            compress: {
              drop_console: true,
              drop_debugger: true,
            },
            mangle: true,
            sourceMap: true,
            output: {
              comments: false,
            },
          }),
        ],
      }
    ],
    external: ['dexie', 'yjs', 'lib0'],
    plugins: [
      typescript({
        tsconfig: 'src/tsconfig.json',
        compilerOptions: {
          target: 'es2016',
        },
        declarationDir: 'dist/',
        inlineSources: true, // We get the real source code in the sourcemap
      }),
      nodeResolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs(),
      replace({
        preventAssignment: true,
        values: {
          __VERSION__: JSON.stringify(pkg.version),
        },
      }),
    ],
    /*onwarn({ loc, frame, code, message }) {
      //if (ERRORS_TO_IGNORE.includes(code)) return;
      if (loc) {
        console.warn(`${loc.file} (${loc.line}:${loc.column}) ${message}`);
        if (frame) console.warn(frame);
      } else {
        console.warn(`${code} ${message}`);
      }
    },*/
  };
}

createBanner();

export default [
  createRollupConfig('src/y-dexie.ts', 'y-dexie')
];
