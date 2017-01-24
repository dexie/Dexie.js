// Include common configuration
const karmaCommon = require('./karma.common');

module.exports = function (config) {
  config.set(Object.assign({}, karmaCommon, {
    // Base path should point at the root 
    basePath: '..',
    files: karmaCommon.files.concat([
      'dist/dexie.js',
      'test/bundle.js',
      { watched: true, included: false, served: true, pattern: 'test/worker.js' },
    ])
  }));
}
