const { configureLambdaTest } = require('./karma.lambdatest');

/* Base karma configurations to require and extend from other karma.conf.js
 */
const karmaCommon = {
  hostname: 'localhost.lambdatest.com',
  // Use qunitjs 1.23.1 instead of qunit 2.x
  // We load it manually in files array instead of using the 'qunit' framework
  frameworks: [],

  reporters: ['mocha'],

  client: {
    captureConsole: false,
  },

  colors: true,

  browserNoActivityTimeout: 2 * 60 * 1000,
  browserDisconnectTimeout: 10000,
  processKillTimeout: 10000,
  browserSocketTimeout: 20000,

  plugins: [
    'karma-qunit',
    'karma-mocha-reporter',
    'karma-chrome-launcher',
    'karma-firefox-launcher',
    'karma-webdriver-launcher'
  ],

  files: [
    'test/babel-polyfill/polyfill.min.js',
    // Load qunitjs 1.23.1 manually (creates global QUnit, asyncTest, test, etc.)
    'node_modules/qunitjs/qunit/qunit.js',
    // karma-qunit adapter (expects window.QUnit to exist)
    'node_modules/karma-qunit/lib/adapter.js',
    'test/karma-env.js',
    {
      pattern: 'test/worker.js',
      watched: true,
      included: false,
      served: true,
    },
    {
      pattern: '!(node_modules|tmp)*/*.map',
      watched: false,
      included: false,
      served: true,
    },
  ],
};

configureLambdaTest(karmaCommon);

const browserSuiteToUse = process.env.NODE_ENV === 'release'
  ? 'pre_npm_publish' // When run by tools/release.sh
  : process.env.LT_USERNAME && process.env.GH_ACTIONS
  ? "ci" // Automated CI
  : process.env.GH_ACTIONS
  ? "ciLocal" // "ci" when not having the credentials (= forks of the dexie repo)
  : 'local'; // Developer local machine

console.log('LT_TUNNEL_NAME', process.env.LT_TUNNEL_NAME);

const defaultBrowserMatrix = require('./karma.browsers.matrix');

/**
 * @param browserMatrixOverrides {{full: string[], ci: string[]}}
 *  Map between browser suite and array of browser to test.
 * @param configOverrides {Object} configOverrides to the common template
 */
function getKarmaConfig(browserMatrixOverrides, configOverrides) {
  console.log('Browser-suite: ' + browserSuiteToUse);
  browserMatrixOverrides = Object.assign(
    {},
    defaultBrowserMatrix,
    browserMatrixOverrides
  );
  const browsers = browserMatrixOverrides[browserSuiteToUse];
  console.log('Browsers to test: ' + browsers.join(', '));
  const finalConfig = Object.assign({}, karmaCommon, configOverrides, {
    browsers,
  });
  return finalConfig;
}

module.exports = {
  karmaCommon,
  getKarmaConfig,
  browserSuiteToUse,
  defaultBrowserMatrix,
};
