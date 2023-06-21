module.exports = {
  customLaunchers: {
    lt_firefox: {
      browserName: 'firefox',
      browserVersion: '114',
      'LT:Options': {
        platformName: 'Windows 10'
      }
    },
    lt_edge: {
      browserName: 'Edge',
      browserVersion: '114',
      'LT:Options': {
        platformName: 'Windows 10'
      }
    },
    lt_chrome: {
      browserName: "Chrome",
      browserVersion: "114",
      'LT:Options': {
        platformName: 'Windows 10'
      }
    },
    lt_safari: {
      browserName: "Safari",
      browserVersion: "16",
      'LT:Options': {
        platformName: 'MacOS Ventura'
      }
    }
  }
};
