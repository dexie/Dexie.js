module.exports = function(config) {
  var cfg = {};
  require('./karma.conf')({set: function (x){cfg = x;}});
  cfg.client = {
    captureConsole: true
  };
  cfg.port = 19145;
  cfg.browserStack = {
      username: process.env.BROWSER_STACK_USERNAME,
      accessKey: process.env.BROWSER_STACK_ACCESS_KEY
  };
  if (!cfg.browserStack.username)
    throw new Error("You must provider username/key in the env variables BROWSER_STACK_USERNAME and BROWSER_STACK_ACCESS_KEY");

  cfg.customLaunchers = {
    bs_firefox_latest: {
      base: 'BrowserStack',
      browser: 'firefox',
      browser_version: 'latest',
      os: 'Windows',
      os_version: 7
    },
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
    bs_ie11: {
      base: 'BrowserStack',
      browser: 'ie',
      browser_version: '11',
      os: 'Windows',
      os_version: 7
    },
    bs_chrome: {
      base: 'BrowserStack',
      browser: "Chrome",
      browser_version: "49",
      os: 'OS X',
      os_version: 'Mountain Lion'
    },
    bs_chrome_latest: {      
      base: 'BrowserStack',
      browser: "Chrome",
      browser_version: "latest",
      os: 'Windows',
      os_version: 10
    }
  };

  cfg.browsers = [
    'bs_chrome',
    'bs_chrome_latest',
    'bs_firefox',
    'bs_firefox_latest',
    'bs_edge',
    'bs_ie11'
  ];

  cfg.plugins = [
      'karma-qunit',
      'karma-mocha-reporter',
      'karma-browserstack-launcher'
  ];

  config.set(cfg);
};
