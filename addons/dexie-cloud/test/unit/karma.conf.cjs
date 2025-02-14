// Include common configuration
const {karmaCommon, getKarmaConfig, defaultBrowserMatrix} = require('../../../../test/karma.common');

module.exports = function (config) {
  const browserMatrixOverrides = {
    // Be fine with testing on local travis firefox + browserstack chrome, latest supported.
    ci: ["Chrome"],
    // Safari fails to reply on browserstack. Need to not have it here.
    // Just complement with old chrome browser that is not part of CI test suite.
    pre_npm_publish: [
      "Chrome",
    ]
  };

  const cfg = getKarmaConfig(browserMatrixOverrides, {
    // Base path should point at the root 
    basePath: '../../../../',
    files: karmaCommon.files.concat([
      'dist/dexie.js',
      'addons/dexie-cloud/node_modules/rxjs/dist/bundles/rxjs.umd.js',
      'addons/dexie-cloud/test/unit/bundle.js',
      { pattern: 'addons/dexie-cloud/test/*.map', watched: false, included: false },
      { pattern: 'addons/dexie-cloud/dist/*.map', watched: false, included: false }
    ])
  });

  cfg.hostname = 'localhost';
  cfg.port = 9876;

  config.set(cfg);
}
