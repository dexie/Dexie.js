// Include common configuration
const {karmaCommon, getKarmaConfig, defaultBrowserMatrix} = require('../../../test/karma.common');

module.exports = function (config) {
  const cfg = getKarmaConfig({
    // Be fine with testing on local Firefox only (no browserstack). This lib is not sensitive to browser differences.
    ci: ["Firefox"],
    pre_npm_publish: ["Firefox"]
  }, {
    basePath: '..',
    files: [
      'test/dist/bundle.js'
    ]
  });

  config.set(cfg);
}
