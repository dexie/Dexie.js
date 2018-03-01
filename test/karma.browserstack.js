module.exports = {
  browserStack: {
    username: process.env.BROWSER_STACK_USERNAME,
    accessKey: process.env.BROWSER_STACK_ACCESS_KEY
  },

  customLaunchers: {
    bs_firefox_latest_supported: { 
      base: 'BrowserStack',
      browser: 'firefox',
      browser_version: '58',
      os: 'Windows',
      os_version: 7
    },
    bs_firefox_oldest_supported: {
      base: 'BrowserStack',
      browser: 'firefox',
      browser_version: '47.0',
      os: 'OS X',
      os_version: 'El Capitan'
    },
    bs_edge_oldest_supported: {
      base: 'BrowserStack',
      browser: "Edge",
      browser_version: '13',
      os: 'Windows',
      os_version: '10'
    },
    bs_edge_latest_supported: {
      base: 'BrowserStack',
      browser: 'Edge',
      browser_version: '16',
      os: 'Windows',
      os_version: '10'
    },
    bs_ie11: {
      base: 'BrowserStack',
      browser: 'ie',
      browser_version: '11',
      os: 'Windows',
      os_version: 10
    },
    bs_chrome_oldest_supported: {
      base: 'BrowserStack',
      browser: "Chrome",
      browser_version: "49",
      os: 'OS X',
      os_version: 'Mountain Lion'
    },
    bs_chrome_latest_supported: {      
      base: 'BrowserStack',
      browser: "Chrome",
      browser_version: "64",
      os: 'Windows',
      os_version: 10
    },
    bs_safari: {
      base: 'BrowserStack',
      browser: "Safari",
      browser_version: "10.1",
      os: 'OS X',
      os_version: 'Sierra'
    },
    bs_iphone7: {
      base: 'BrowserStack',
      browser: "Safari",
      browser_version: "10.1",
      os: 'iOS',
      os_version: "10.3"
    }
  }
}
