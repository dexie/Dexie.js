// Include common configuration
const {karmaCommon, getKarmaConfig, defaultBrowserMatrix} = require('../../../../test/karma.common');

module.exports = function (config) {
  const browserMatrixOverrides = {
    // Be fine with testing on local travis firefox + browserstack chrome, latest supported.
    ci: ["Firefox", "bs_chrome_latest_supported"],
    // Safari fails to reply on browserstack. Need to not have it here.
    // Just complement with old chrome browser that is not part of CI test suite.
    pre_npm_publish: [
      "bs_chrome_oldest_supported",
    ]
  };

  const cfg = getKarmaConfig(browserMatrixOverrides, {
    // Base path should point at the root 
    basePath: '../../../../',
    // The files needed to apply dexie-observable to the standard dexie unit tests.
    files: karmaCommon.files.concat([
      'dist/dexie.js',
      'addons/Dexie.Syncable/test/integration/karma-env.js',
      'addons/Dexie.Observable/dist/dexie-observable.js', // Apply observable addon
      'addons/Dexie.Syncable/dist/dexie-syncable.js', // Apply syncable addon
      'addons/Dexie.Syncable/test/integration/dummy-sync-protocol.js',
      'test/bundle.js', // The dexie standard test suite
      { pattern: 'addons/Dexie.Observable/dist/*.map', watched: false, included: false },
      { pattern: 'addons/Dexie.Syncable/dist/*.map', watched: false, included: false }
    ])
  });

  config.set(cfg);
}
