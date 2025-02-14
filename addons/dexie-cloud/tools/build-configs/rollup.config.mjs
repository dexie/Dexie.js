// @ts-check
//import sourcemaps from 'rollup-plugin-sourcemaps';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import { readFileSync, writeFileSync } from 'fs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
// @ts-ignore: requires tsconfig settings that we don't need for the web build but is ok here in the build config.
import pkg from '../../package.json' assert { type: 'json' };
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
 * @param {String} entry such as src/dexie-cloud-client.ts
 * @param {String} outputName such as dexie-cloud-addon
 * @returns
 */
export function createRollupConfig(entry, outputName) {
  return {
    input: entry,
    output: [
      {
        file: `dist/modern/${outputName}.js`,
        format: 'es',
        banner: readFileSync('tools/tmp/banner.txt', 'utf-8'),
        sourcemap: true,
      },
      {
        file: `dist/modern/${outputName}.min.js`,
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
      },
      {
        file: `dist/umd/${outputName}.js`,
        format: 'umd',
        globals: {
          dexie: 'Dexie',
          rxjs: 'rxjs',
          'rxjs/operators': 'rxjs.operators',
        },
        name: 'DexieCloud',
        banner: readFileSync('tools/tmp/banner.txt', 'utf-8'),
        sourcemap: true,
        exports: 'named',
      },
      {
        file: `dist/umd/${outputName}.min.js`,
        format: 'umd',
        globals: {
          dexie: 'Dexie',
          rxjs: 'rxjs',
          'rxjs/operators': 'rxjs.operators',
        },
        name: 'DexieCloud',
        banner: readFileSync('tools/tmp/banner.txt', 'utf-8'),
        sourcemap: true,
        exports: 'named',
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
      },
    ],
    external: ['dexie', 'rxjs'],
    plugins: [
      typescript({
        tsconfig: 'src/tsconfig.json',
        compilerOptions: {
          target: 'es2016',
        },
        declarationDir: 'dist/',
        //sourceMap: false, // Required (see https://stackoverflow.com/questions/63218218/rollup-is-not-generating-typescript-sourcemap)
        inlineSources: true, // But this was even better because then we get the real source code in the sourcemap!
      }),
      //sourcemaps(),
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
  createRollupConfig('src/dexie-cloud-addon.ts', 'dexie-cloud-addon'),
  createRollupConfig('src/service-worker.ts', 'service-worker'),
];
