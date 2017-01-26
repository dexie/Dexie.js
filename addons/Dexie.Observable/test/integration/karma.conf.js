// Include common configuration
const {karmaCommon, getKarmaConfig, defaultBrowserMatrix} = require('../../../../test/karma.common');

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
    // Base path should point at the root 
    basePath: '../../../../',
    // Use alternate port than the unit test uses, so they can run in parallel on a dev machine.
    port: karmaCommon.port + 1,
    // The files needed to apply dexie-observable to the standard dexie unit tests.
    files: karmaCommon.files.concat([
      'dist/dexie.js',
      'addons/Dexie.Observable/test/integration/karma-env.js',
      'addons/Dexie.Observable/dist/dexie-observable.js', // Apply observable addon
      'test/bundle.js', // The dexie standard test suite
      { pattern: 'addons/Dexie.Observable/dist/*.map', watched: false, included: false }
    ])
  });

  config.set(cfg);
}
