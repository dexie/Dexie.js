module.exports = {
  customLaunchers: {
    lt_firefox_latest_supported: {
      browserName: 'firefox',
      browserVersion: '111',
      'LT:Options': {
        platformName: 'Windows 10'
      }
    },
    lt_firefox_oldest_supported: {
      browserName: 'firefox',
      browserVersion: '93.0',
      'LT:Options': {
        platformName: 'MacOS Catalina'
      }
    },
    lt_edge_oldest_supported: {
      browserName: "Edge",
      browserVersion: '95',
      'LT:Options': {
        platformName: 'Windows 10'
      }
    },
    lt_edge_latest_supported: {
      browserName: 'Edge',
      browserVersion: '111',
      'LT:Options': {
        platformName: 'Windows 10'
      }
    },
    lt_chrome_oldest_supported: {
      browserName: "Chrome",
      browserVersion: "94",
      'LT:Options': {
        platformName: 'macOS Sierra'
      }
    },
    lt_chrome_latest_supported: {
      browserName: "Chrome",
      browserVersion: "112",
      'LT:Options': {
        platformName: 'Windows 10'
      }
    },
    lt_safari_oldest_supported: {
      browserName: "Safari",
      browserVersion: "14",
      'LT:Options': {
        platformName: 'MacOS Big sur'
      }
    },
    lt_safari_latest_supported: {
      browserName: "Safari",
      browserVersion: "16",
      'LT:Options': {
        platformName: 'MacOS Ventura'
      }
    }
  }
}
