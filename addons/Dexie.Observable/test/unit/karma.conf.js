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
    files: karmaCommon.files.concat([
      'dist/dexie.js',
      'addons/Dexie.Observable/dist/dexie-observable.js',
      'addons/Dexie.Observable/test/unit/bundle.js',
      { pattern: 'addons/Dexie.Observable/test/unit/*.map', watched: false, included: false },
      { pattern: 'addons/Dexie.Observable/dist/*.map', watched: false, included: false }
    ])
  });

  config.set(cfg);
}
