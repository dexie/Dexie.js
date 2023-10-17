// @ts-check
//import sourcemaps from 'rollup-plugin-sourcemaps';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import { readFileSync, writeFileSync } from 'fs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import pkg from '../../package.json' assert { type: 'json' };
import fs from 'fs';

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
    ],
    external: ['dexie', 'rxjs'],
    plugins: [
      typescript({
        tsconfig: 'src/tsconfig.json',
        compilerOptions: {
          target: 'es2016',
        },
        declarationDir: 'dist/',
      }),
      //sourcemaps(),
      nodeResolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs(),
    ],
  };
}

createBanner();

export default [
  createRollupConfig('src/dexie-cloud-addon.ts', 'dexie-cloud-addon'),
  createRollupConfig('src/service-worker.ts', 'service-worker')
];
