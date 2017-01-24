// Include common configuration
const karmaCommon = require('../../../../test/karma.common');

module.exports = function (config) {
  config.set(Object.assign({}, karmaCommon, {
    // Base path should point at the root 
    basePath: '..../../../',
    files: karmaCommon.files.concat([
      'dist/dexie.js',
      'addons/Dexie.Observable/dist/dexie-observable.js',
      'addons/Dexie.Observable/test/integration/bundle.js',
      // TODO: Include map files!
      { watched: true, included: false, served: true, pattern: 'test/worker.js' }, // Only integration have this!
    ])
  }));
}
