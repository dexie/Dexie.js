const path = require('path');

module.exports = {
  entry: './index.js',
  resolve: {
    alias: {
      dexie: path.resolve(__dirname, '../../../dist/dexie.js')
    }
  },
  externals: {
    QUnit: 'QUnit',
    dexie: 'Dexie'
  },
  output: {
    filename: 'test-bundle.js',
    path: path.resolve(__dirname, './dist'),
  },
};