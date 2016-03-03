module.exports = function(config) {
  const configuration = {
    basePath: '..',

    frameworks: [
      'qunit',
    ],

    reporters: [
      'mocha'
    ],

    client: {
      captureConsole: false
    },

    files: [
      'test/qunit.js',
      'test/karma-env.js',
      'dist/dexie.js',
      'test/bundle.js',
      { pattern: 'test/worker.js', included: false },
      { pattern: '**/*.map', watched: false, included: false, served: true}
    ],

    port: 9876,
    captureTimeout: 30 * 1000,
    browserNoActivityTimeout: 10 * 60 * 1000,
    colors: true,

    browsers: [
      'Chrome'
    ],

    plugins: [
      'karma-qunit',
      'karma-mocha-reporter',
      'karma-chrome-launcher'
    ]
  };

  config.set(configuration);
};
