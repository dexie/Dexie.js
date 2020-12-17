const path = require('path');

module.exports = {
  entry: './src/index.ts',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  optimization: {
    //minimize: false // to see a not-minimized output.
  },
  output: {
    library: 'DexieReactHooks',
    libraryTarget: 'umd',
    filename: 'dexie-react-hooks.js',
    path: path.resolve(__dirname, 'dist'),
  },
  externals: {
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react',
      root: 'React'
    },
    "react-dom": {
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'react-dom',
      root: 'ReactDOM'
    },
    dexie: {
      commonjs: 'dexie',
      commonjs2: 'dexie',
      amd: 'dexie',
      root: 'Dexie'
    }
  }
};
