//import {readFileSync} from 'fs';
//import path from 'path';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

//const version = require(path.resolve(__dirname, './package.json')).version;

const ERRORS_TO_IGNORE = [
  "THIS_IS_UNDEFINED",
];

export default {
  input: './src/index.ts',
  output: [{
    file: 'dist/dexie-react-hooks.js',
    format: 'umd',
    globals: {dexie: "Dexie", react: "React", "react-dom": "ReactDOM"},
    name: 'DexieReactHooks',
    sourcemap: true,
    exports: 'named'
  },{
    file: 'dist/dexie-react-hooks.mjs',
    format: 'es',
    sourcemap: true
  }],
  external: ['dexie', 'react', 'react-dom'],
  plugins: [
    typescript(),
    nodeResolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
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
