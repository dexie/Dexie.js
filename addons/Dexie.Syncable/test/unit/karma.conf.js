// Include common configuration
const {karmaCommon, getKarmaConfig, defaultBrowserMatrix} = require('../../../../test/karma.common');

module.exports = function (config) {
  const browserMatrixOverrides = {
    // Be fine with testing on local travis firefox.
    ci: ["Firefox"],
    // IE indexedDB hangs sporadically. Be fine with testing it once on Dexie main suite.
    full: defaultBrowserMatrix.full.filter(b => !/bs_ie/i.test(b))
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
