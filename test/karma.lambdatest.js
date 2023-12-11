module.exports = {
  customLaunchers: {
    remote_firefox: {
      browserName: 'firefox',
      browserVersion: '118',
      'LT:Options': {
        platformName: 'Windows 10'
      }
    },
    remote_edge: {
      browserName: 'Edge',
      browserVersion: '118',
      'LT:Options': {
        platformName: 'Windows 10'
      }
    },
    remote_chrome: {
      browserName: "Chrome",
      browserVersion: "118",
      'LT:Options': {
        platformName: 'Windows 10'
      }
    },
    remote_safari: {
      browserName: "Safari",
      browserVersion: "16",
      'LT:Options': {
        platformName: 'MacOS Ventura'
      }
    }
  }
};
