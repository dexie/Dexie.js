module.exports = function(config) {
  const configuration = {
    basePath: '..',

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
      'test/qunit.js',
      'test/karma-env.js',
      'dist/dexie.js',
      'test/bundle.js',
      { pattern: 'test/worker.js', included: false },
      { pattern: '**/*.map', watched: false, included: false, served: true}
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
