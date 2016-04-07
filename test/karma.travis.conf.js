module.exports = function(config) {
  var cfg = {};
  require('./karma.conf')({set: function (x){cfg = x;}});
  cfg.client = {
    captureConsole: false
  };
  cfg.port = 19145;
  cfg.browserStack = {
      username: process.env.BROWSER_STACK_USERNAME,
      accessKey: process.env.BROWSER_STACK_ACCESS_KEY
  };
  if (!cfg.browserStack.username)
    throw new Error("You must provider username/key in the env variables BROWSER_STACK_USERNAME and BROWSER_STACK_ACCESS_KEY");

  cfg.customLaunchers = {
    bs_firefox: {
      base: 'BrowserStack',
      browser: 'firefox',
      browser_version: '45.0',
      os: 'OS X',
      os_version: 'El Capitan'
    },
  };

  cfg.browsers = [
    'bs_firefox',
  ];

  cfg.plugins = [
      'karma-qunit',
      'karma-mocha-reporter',
      'karma-browserstack-launcher'
  ];

  config.set(cfg);
};
