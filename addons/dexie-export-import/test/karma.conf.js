// Include common configuration
const {karmaCommon, getKarmaConfig, defaultBrowserMatrix} = require('../../../test/karma.common');

module.exports = function (config) {
  const cfg = getKarmaConfig({
    // I get error from browserstack/karma (not our code) when trying bs_iphone7.
    // If trying bs_safari it just times out.
    // Unit tests have been manually tested on Safari 12 though.
    ci: defaultBrowserMatrix.ci.filter(b => b !== 'bs_iphone7'),
    local: ["bs_ie11"], // Uncomment to use browserstack browsers from home
    // bs_iphone bails out before running any test at all.
    pre_npm_publish: defaultBrowserMatrix.pre_npm_publish.filter(b => !/bs_iphone7/i.test(b))
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
