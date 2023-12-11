// Include common configuration
const {karmaCommon, getKarmaConfig, defaultBrowserMatrix} = require('../../../test/karma.common');

module.exports = function (config) {
  const cfg = getKarmaConfig({}, {
    basePath: '..',
    files: [
      'test/dist/bundle.js'
    ]
  });

  config.set(cfg);
}
