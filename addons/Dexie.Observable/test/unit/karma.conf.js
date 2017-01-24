// Include common configuration
const karmaCommon = require('../../../../test/karma.common');

module.exports = function (config) {
  config.set(Object.assign({}, karmaCommon, {
    // Base path should point at the root 
    basePath: '../../../../',
    files: karmaCommon.files.concat([
      'dist/dexie.js',
      'addons/Dexie.Observable/dist/dexie-observable.js',
      'addons/Dexie.Observable/test/unit/bundle.js',
      { pattern: 'addons/Dexie.Observable/test/unit/*.map', watched: false, included: false },
      { pattern: 'addons/Dexie.Observable/dist/*.map', watched: false, included: false }
    ])
  }));
}
