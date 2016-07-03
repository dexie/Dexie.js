module.exports = function(config) {
  var cfg = {};
  require('./karma.conf')({set: function (x){cfg = x;}});
  cfg.client = {
    captureConsole: false
  };
  cfg.port = 19145;
  
  var useBrowserStack = process.env.TRAVIS_PULL_REQUEST === 'false' && process.env.BROWSER_STACK_USERNAME;

  if (useBrowserStack) {  
    cfg.browserStack = {
        username: process.env.BROWSER_STACK_USERNAME,
        accessKey: process.env.BROWSER_STACK_ACCESS_KEY
    };
  }

  cfg.customLaunchers = {
    bs_firefox: {
      base: 'BrowserStack',
      browser: 'firefox',
      browser_version: '46.0',
      os: 'Windows',
      os_version: '10'
    },
  };

  cfg.browsers = !useBrowserStack ? ['Firefox'] : [
    'bs_firefox'
  ];

  cfg.plugins = [
      'karma-qunit',
      'karma-mocha-reporter',
      'karma-browserstack-launcher',
      'karma-firefox-launcher'
  ];

  config.set(cfg);
};
