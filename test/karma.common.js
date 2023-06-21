/* Base karma configurations to require and extend from other karma.conf.js
 */
const karmaCommon = {
  hostname: 'localhost.lambdatest.com',
  frameworks: ['qunit'],

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
    'karma-browserstack-launcher',
    'karma-webdriver-launcher'
  ],

  files: [
    'test/babel-polyfill/polyfill.min.js',
    'node_modules/qunitjs/qunit/qunit.js',
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

  browserStack: require('./karma.browserstack.js').browserStack,

  customLaunchers: {...require('./karma.browserstack.js').customLaunchers}
};

if (process.env.LAMBDATEST) {
  const ltBrowsers = require('./karma.lambdatest.js').customLaunchers;

  const webdriverConfig = {
    hostname: 'hub.lambdatest.com',
    port: 80,
  };
  
  const webdriverConfigMobile = {
    hostname: 'mobile-hub.lambdatest.com',
    port: 80,
  };
  
  for (const key of Object.keys(ltBrowsers)) {
    ltBrowsers[key].base = 'WebDriver';
    if (ltBrowsers[key].isRealMobile) {
      ltBrowsers[key].config = webdriverConfigMobile;
      ltBrowsers[key].user = process.env.LT_USERNAME;
      ltBrowsers[key].accessKey = process.env.LT_ACCESS_KEY;
      ltBrowsers[key].tunnel = true;
      ltBrowsers[key].console = true;
      ltBrowsers[key].network = true;
      ltBrowsers[key].tunnelName = process.env.LT_TUNNEL_NAME || 'jasmine';
      ltBrowsers[key].pseudoActivityInterval = 5000; // 5000 ms heartbeat
    } else {
      ltBrowsers[key].config = webdriverConfig;
      ltBrowsers[key]['LT:Options'].username = process.env.LT_USERNAME;
      ltBrowsers[key]['LT:Options'].accessKey = process.env.LT_ACCESS_KEY;
      ltBrowsers[key]['LT:Options'].tunnel = true;
      ltBrowsers[key]['LT:Options'].console = true;
      ltBrowsers[key]['LT:Options'].network = true;
      ltBrowsers[key]['LT:Options'].tunnelName =
        process.env.LT_TUNNEL_NAME || 'jasmine';
      ltBrowsers[key]['LT:Options'].pseudoActivityInterval = 5000; // 5000 ms heartbeat
    }

    ltBrowsers[key].retryLimit = 2;
  }

  karmaCommon.hostname = 'localhost.lambdatest.com';
  karmaCommon.customLaunchers = {
    ...karmaCommon.customLaunchers,
    ...ltBrowsers
  };
}


const browserSuiteToUse = process.env.NODE_ENV === 'release'
  ? 'pre_npm_publish' // When run by tools/release.sh
  : process.env.BROWSER_STACK_USERNAME || process.env.LT_USERNAME
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
