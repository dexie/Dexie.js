module.exports = function(config) {
  const configuration = {
    basePath: '',

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
      'dist/dexie.min.js',
      'test/dexie-unittest-utils.js',
      'test/tests-extendability.js',
      'test/tests-promise.js',
      'test/tests-table.js',
      'test/tests-open.js',
      'test/tests-collection.js',
      'test/tests-whereclause.js',
      'test/tests-exception-handling.js',
      'test/tests-upgrading.js',
      'test/tests-transaction.js',
      'test/tests-performance.js',
      { pattern: 'test/worker.js', included: false },
    ],

    port: 9876,
    captureTimeout: 10 * 1000,
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
