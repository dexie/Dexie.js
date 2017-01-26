/* Base karma configurations to require and extend from other karma.conf.js
*/
const karmaCommon = {
    frameworks: [
      'qunit'
    ],

    reporters: [
      'mocha'
    ],

    client: {
      captureConsole: false
    },

    port: 19144,
    
    colors: true,

    browserNoActivityTimeout: 2 * 60 * 1000,

    plugins: [
      'karma-qunit',
      'karma-mocha-reporter',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-browserstack-launcher',
    ],

    files: [
      'test/babel-polyfill/polyfill.min.js',
      'node_modules/qunitjs/qunit/qunit.js',
      'test/karma-env.js',
      { pattern: 'test/worker.js', watched: true, included: false, served: true },
      { pattern: '!(node_modules|tmp)*/*.map', watched: false, included: false, served: true}
    ],
    
    browserStack: require('./karma.browserstack.js').browserStack,

    customLaunchers: require('./karma.browserstack.js').customLaunchers
};

const browserSuiteToUse = process.env.NODE_ENV === 'release' ?
  "full" :
  process.env.TRAVIS ?
    isNaN(process.env.TRAVIS_PULL_REQUEST) && process.env.BROWSER_STACK_USERNAME ?
      "ci" :              // CI pushs to master and browserstack credentials exists
      "ciLocal" :         // CI pull request or has no browserstack credentials.
  "local";                // Developer local machine

const defaultBrowserMatrix = require('./karma.browsers.matrix');

/**
 * @param browserMatrixOverrides {{full: string[], ci: string[]}}
 *  Map between browser suite and array of browser to test.
 * @param configOverrides {Object} configOverrides to the common template
 */
function getKarmaConfig (browserMatrixOverrides, configOverrides) {
  console.log("Browser-suite: " + browserSuiteToUse);
  browserMatrixOverrides = Object.assign({}, defaultBrowserMatrix, browserMatrixOverrides);
  const browsers = browserMatrixOverrides[browserSuiteToUse];
  console.log("Browsers to test: " + browsers.join(', '));
  const finalConfig = Object.assign({}, karmaCommon, configOverrides, {browsers});
  return finalConfig;
}

module.exports = {karmaCommon, getKarmaConfig, browserSuiteToUse, defaultBrowserMatrix};
