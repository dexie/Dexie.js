// Include common configuration
const {karmaCommon, getKarmaConfig, defaultBrowserMatrix} = require('../../../test/karma.common');

module.exports = function (config) {
  const cfg = getKarmaConfig({},{
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
