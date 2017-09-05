// Include common configuration
const {karmaCommon, getKarmaConfig, defaultBrowserMatrix} = require('../../../../test/karma.common');

module.exports = function (config) {
  const browserMatrixOverrides = {
    // Be fine with testing on local travis firefox + browserstack chrome, latest supported.
    ci: ["Firefox", "bs_chrome_latest_supported"],
    // This addon is not yet ready for full-blown tests on iphone/Safari. That's one of the reason it is still in beta.
    // Firefox 55 has bug that is triggered when addons are present. Bug is fixed for FF57: https://bugzilla.mozilla.org/show_bug.cgi?id=1395071
    pre_npm_publish: defaultBrowserMatrix.pre_npm_publish.filter(b => 
      !/bs_iphone7|bs_firefox_latest_supported/i.test(b))
  };

  const cfg = getKarmaConfig(browserMatrixOverrides, {
    // Base path should point at the root 
    basePath: '../../../../',
    // Use alternate port than the unit test uses, so they can run in parallel on a dev machine.
    port: karmaCommon.port + 1,
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
