// Include common configuration
const {karmaCommon, getKarmaConfig, defaultBrowserMatrix} = require('../../../test/karma.common');

module.exports = function (config) {
  const cfg = getKarmaConfig({}, {
    basePath: '../../..',
    files: [
      // Load babel polyfill
      'test/babel-polyfill/polyfill.min.js',
      // Load qunitjs 1.23.1 manually
      'node_modules/qunitjs/qunit/qunit.js',
      // karma-qunit adapter
      'node_modules/karma-qunit/lib/adapter.js',
      // karma environment setup
      'test/karma-env.js',
      // Test bundle
      'libs/dexie-react-hooks/test/dist/bundle.js'
    ]
  });

  config.set(cfg);
}
