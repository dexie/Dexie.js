import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  entry: 'out/ts/app.js',
  dest: 'out/bundle.js',
  format: 'iife',
  sourceMap: true,
  onwarn: function ( message ) {
    if ( /The 'this' keyword is equivalent to 'undefined' at the top level of an ES module/.test( message ) ) return;
    console.warn(message);
  },
  plugins: [resolve(), commonjs()]
};
