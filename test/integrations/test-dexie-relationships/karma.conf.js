// Include common configuration
const {karmaCommon, getKarmaConfig, defaultBrowserMatrix} = require('../../karma.common');

module.exports = function (config) {
  const browserMatrixOverrides = {
    // Be fine with testing on local travis firefox for both pull requests and pushs.
    ci: ["Firefox"],
    // Be fine with chrome for this particular integration test.
    pre_npm_publish: ['bs_chrome_latest_supported']
  };

  const cfg = getKarmaConfig(browserMatrixOverrides, {
    // Base path should point at dexie root
    basePath: '../../../',
    // The files needed to apply dexie-observable to the standard dexie unit tests.
    files: karmaCommon.files.concat([
      'dist/dexie.js', // Dexie
      'test/integrations/test-dexie-relationships/node_modules/dexie-relationships/dist/index.js', // dexieRelationships
      'test/integrations/test-dexie-relationships/dist/test-bundle.js',
      { pattern: 'test/integrations/test-dexie-relationships/dist/test-bundle.js.map', included: false },
      { pattern: 'test/integrations/test-dexie-relationships/node_modules/dexie-relationships/dist/*.map', included: false },
    ])
  });

  config.set(cfg);
}
