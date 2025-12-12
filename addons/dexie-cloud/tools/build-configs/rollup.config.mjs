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
 * @param {String} entry such as src/dexie-cloud-client.ts
 * @param {String} outputName such as dexie-cloud-addon
 * @returns
 */
export function createRollupConfigs(entry, outputName) {
  // TypeScript plugin for modern build (generates .d.ts files)
  const modernTypescriptPlugin = typescript({
    tsconfig: 'src/tsconfig.json',
    compilerOptions: {
      target: 'es2016',
      declaration: true,
      declarationDir: 'dist/modern',
    },
    inlineSources: true,
  });

  // TypeScript plugin for UMD build (no declarations needed)
  const umdTypescriptPlugin = typescript({
    tsconfig: 'src/tsconfig.json',
    compilerOptions: {
      target: 'es2016',
      declaration: false,
    },
    inlineSources: true,
  });

  const COMMON_NON_TS_PLUGINS = [
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
  ];

  // DEV and PRODUCTION build plugins
  const DEV_BUILD_PLUGINS = [];

  // PROD build plugins removes console logs and minifies code
  const PRODUCTION_BUILD_PLUGINS = [
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
  ];

  return [
    //
    // Modern ES builds
    //
    {
      input: entry,
      output: [
        // Modern DEV build
        {
          file: `dist/modern/${outputName}.js`,
          format: 'es',
          banner: readFileSync('tools/tmp/banner.txt', 'utf-8'),
          sourcemap: true,
          plugins: DEV_BUILD_PLUGINS,
        },
        // Modern PROD build
        {
          file: `dist/modern/${outputName}.min.js`,
          format: 'es',
          banner: readFileSync('tools/tmp/banner.txt', 'utf-8'),
          sourcemap: true,
          plugins: PRODUCTION_BUILD_PLUGINS,
        },
      ],
      plugins: [modernTypescriptPlugin, ...COMMON_NON_TS_PLUGINS],
      external: ['dexie', 'rxjs', 'rxjs/operators', 'y-dexie', 'lib0', 'lib0/encoding', 'lib0/decoding', 'yjs', 'y-protocols/awareness'],
    },

    //
    // UMD build
    //
    {
      input: entry,
      output: [
        // UMD DEV build
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
          plugins: DEV_BUILD_PLUGINS,
        },
        // UMD PROD build
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
          plugins: PRODUCTION_BUILD_PLUGINS,
        },
      ],
      plugins: [umdTypescriptPlugin, ...COMMON_NON_TS_PLUGINS],
      external: ['dexie', 'rxjs', 'rxjs/operators'],
    },
  ];
}

createBanner();

export default [
  ...createRollupConfigs('src/dexie-cloud-addon.ts', 'dexie-cloud-addon'),
  ...createRollupConfigs('src/service-worker.ts', 'service-worker'),
];
