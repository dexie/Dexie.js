module.exports = {
  browserStack: {
    username: process.env.BROWSER_STACK_USERNAME,
    accessKey: process.env.BROWSER_STACK_ACCESS_KEY
  },

  customLaunchers: {
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
      browser_version: '47.0',
      os: 'OS X',
      os_version: 'El Capitan'
    },
    bs_edge_13: {
      base: 'BrowserStack',
      browser: "Edge",
      browser_version: '13',
      os: 'Windows',
      os_version: '10'
    },
    bs_edge: {
      base: 'BrowserStack',
      browser: "Edge",
      browser_version: '14',
      os: 'Windows',
      os_version: '10'
    },
    bs_edge_latest: {
      base: 'BrowserStack',
      browser: 'Edge',
      browser_version: 'latest',
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
  }
}
