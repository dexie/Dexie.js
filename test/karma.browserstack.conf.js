module.exports = function(config) {
  var cfg = {};
  require('./karma.conf')({set: function (x){cfg = x;}});
  cfg.client = {
    captureConsole: true
  };
  cfg.port = 19145;
  cfg.browserStack = {
      username: process.env.BROWSERSTACK_USERNAME,
      accessKey: process.env.BROWSERSTACK_KEY
  };
  cfg.customLaunchers = {
    bs_firefox: {
      base: 'BrowserStack',
      browser: 'firefox',
      browser_version: '45.0',
      os: 'OS X',
      os_version: 'El Capitan'
    },
    bs_edge: {
      base: 'BrowserStack',
      browser: "Edge",
      browser_version: '13',
      os: 'Windows',
      os_version: '10'
    },
    bs_chrome: {
      base: 'BrowserStack',
      browser: "Chrome",
      browser_version: "49",
      os: 'OS X',
      os_version: 'Mountain Lion'
    }
  };

  cfg.browsers = [
    'bs_chrome',
    'bs_firefox',
    'bs_edge'
  ];

  cfg.plugins = [
      'karma-qunit',
      'karma-mocha-reporter',
      'karma-chrome-launcher',
      'karma-browserstack-launcher'
  ];

  config.set(cfg);
};
