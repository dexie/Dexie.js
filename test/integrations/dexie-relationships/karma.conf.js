// Include common configuration
const {karmaCommon, getKarmaConfig, defaultBrowserMatrix} = require('../../karma.common');

module.exports = function (config) {
  const browserMatrixOverrides = {
    // Be fine with testing on local travis firefox for both pull requests and pushs.
    ci: ["Firefox"],
    // IE indexedDB hangs sporadically. Avoid it on integration tests to prohibit the
    // likeliness of having to restart the travis builds over and over. We're testing
    // it on the dexie main suite. That's enough.
    full: defaultBrowserMatrix.full.filter(b => !/bs_ie/i.test(b))
  };

  const cfg = getKarmaConfig(browserMatrixOverrides, {
    // Base path should point at dexie root
    basePath: '../../../',
    // The files needed to apply dexie-observable to the standard dexie unit tests.
    files: karmaCommon.files.concat([
      'dist/dexie.js', // Dexie
      'test/integrations/node_modules/dexie-relationships/dist/index.js', // dexieRelationships
      'test/integrations/dexie-relationships/test-bundle.js',
      { pattern: 'test/integrations/dexie-relationships/test-bundle.js.map', included: false },
      { pattern: 'test/integrations/node_modules/dexie-relationships/dist/*.map', included: false },
    ])
  });

  config.set(cfg);
}
