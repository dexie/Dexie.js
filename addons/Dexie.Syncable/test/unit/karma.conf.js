// Include common configuration
const {karmaCommon, getKarmaConfig, defaultBrowserMatrix} = require('../../../../test/karma.common');

module.exports = function (config) {
  const browserMatrixOverrides = {
    // Be fine with testing on local travis firefox + browserstack chrome, latest supported.
    ci: ["Firefox", "bs_chrome_latest_supported"],
    // This addon is not yet ready for full-blown tests on iphone/Safari. That's one of the reason it is still in beta.
    pre_npm_publish: defaultBrowserMatrix.pre_npm_publish.filter(b => !/bs_iphone7/i.test(b))
  };

  const cfg = getKarmaConfig(browserMatrixOverrides, {
    // Base path should point at the root 
    basePath: '../../../../',
    files: karmaCommon.files.concat([
      'dist/dexie.js',
      'addons/Dexie.Observable/dist/dexie-observable.js',

      'samples/remote-sync/websocket/websocketserver-shim.js',
      'samples/remote-sync/websocket/WebSocketSyncServer.js',// With shim applied, we can run the server in the browser

      'addons/Dexie.Syncable/test/unit/bundle.js',
      { pattern: 'addons/Dexie.Observable/dist/*.map', watched: false, included: false },
      { pattern: 'addons/Dexie.Syncable/dist/*.map', watched: false, included: false },
      { pattern: 'addons/Dexie.Syncable/test/unit/*.map', watched: false, included: false },
    ])
  });

  config.set(cfg);
}
