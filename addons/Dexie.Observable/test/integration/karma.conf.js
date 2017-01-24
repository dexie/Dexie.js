// Include common configuration
const karmaCommon = require('../../../../test/karma.common');

module.exports = function (config) {
  config.set(Object.assign({}, karmaCommon, {
    // Base path should point at the root 
    basePath: '../../../../',
    port: karmaCommon.port + 1,
    files: karmaCommon.files.concat([
      'dist/dexie.js',
      'addons/Dexie.Observable/test/integration/karma-env.js',
      'addons/Dexie.Observable/dist/dexie-observable.js',
      'test/bundle.js',
      { pattern: 'addons/Dexie.Observable/dist/*.map', watched: false, included: false }
    ])
  }));
}
