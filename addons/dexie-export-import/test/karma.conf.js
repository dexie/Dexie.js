// Include common configuration
const {karmaCommon, getKarmaConfig, defaultBrowserMatrix} = require('../../../test/karma.common');

module.exports = function (config) {
  const cfg = getKarmaConfig({
    // Be fine with testing on local travis firefox + browserstack chrome, latest supported.
    ci: ["Firefox", "bs_chrome_latest_supported"],
    // Safari fails to reply on browserstack. Need to not have it here.
    // Just complement with old chrome browser that is not part of CI test suite.
    pre_npm_publish: [
      "bs_chrome_oldest_supported",
    ]
  }, {
    // Base path should point at the root 
    basePath: '../../../',
    files: karmaCommon.files.concat([
      'dist/dexie.js',
      'addons/dexie-export-import/dist/dexie-export-import.js',
      'addons/dexie-export-import/test/bundle.js',
      { pattern: 'addons/dexie-export-import/test/*.map', watched: false, included: false },
      { pattern: 'addons/dexie-export-import/dist/*.map', watched: false, included: false }
    ])
  });

  config.set(cfg);
}
