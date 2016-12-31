module.exports = function(config) {
  const configuration = {
    basePath: '../../../',

    frameworks: [
      'qunit'
    ],

    reporters: [
      'mocha'
    ],

    client: {
      captureConsole: false
    },

    files: [
      'test/babel-polyfill/polyfill.min.js',
      'node_modules/qunitjs/qunit/qunit.js', // Use qunit from Dexie node_modules
      'test/karma-env.js',
      'dist/dexie.js',
      'addons/Dexie.Observable/dist/dexie-observable.js',
      'addons/Dexie.Syncable/test/unit/bundle.js',

      // Needed for integration tests
      'samples/remote-sync/websocket/WebSocketSyncProtocol.js',
      'samples/remote-sync/websocket/websocketserver-shim.js',
      'samples/remote-sync/websocket/WebSocketSyncServer.js',

      // Integration tests for Dexie.Syncable
      'addons/Dexie.Syncable/test/tests-syncable.js',
      'addons/Dexie.Syncable/test/tests-syncable-partials.js',
      'addons/Dexie.Syncable/test/tests-syncprovider.js',
      'addons/Dexie.Syncable/test/tests-WebSocketSyncServer.js',

      { pattern: '**/*.map', watched: false, included: false, served: true},

      // Needed for the Dexie tests
      { pattern: 'test/worker.js', included: false },

      'addons/Dexie.Syncable/test/tests-syncable-dexie.js',

      // Run Dexie tests
      'test/bundle.js'
  ],

    port: 19144,
    //captureTimeout: 30 * 1000,
    //browserNoActivityTimeout: 10 * 60 * 1000,
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    //logLevel: config.LOG_DEBUG,

    browsers: [
        'Chrome'
    ],

    plugins: [
      'karma-qunit',
      'karma-mocha-reporter',
      'karma-chrome-launcher',
      //'karma-firefox-launcher'
    ]
  };

  config.set(configuration);
};
