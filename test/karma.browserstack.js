module.exports = {
  browserStack: {
    username: process.env.BROWSER_STACK_USERNAME,
    accessKey: process.env.BROWSER_STACK_ACCESS_KEY,
    timeout: 1800
  },

  customLaunchers: {
    bs_firefox_latest_supported: { 
      base: 'BrowserStack',
      browser: 'firefox',
      browser_version: '113',
      os: 'Windows',
      os_version: 10
    },
    bs_firefox_oldest_supported: {
      base: 'BrowserStack',
      browser: 'firefox',
      browser_version: '93',
      os: 'OS X',
      os_version: 'El Capitan'
    },
    bs_edge_oldest_supported: {
      base: 'BrowserStack',
      browser: "Edge",
      browser_version: '15',
      os: 'Windows',
      os_version: '10'
    },
    bs_edge_latest_supported: {
      base: 'BrowserStack',
      browser: 'Edge',
      browser_version: '95',
      os: 'Windows',
      os_version: '10'
    },
    bs_chrome_oldest_supported: {
      base: 'BrowserStack',
      browser: "Chrome",
      browser_version: "94",
      os: 'OS X',
      os_version: 'Sierra'
    },
    bs_chrome_latest_supported: {      
      base: 'BrowserStack',
      browser: "Chrome",
      browser_version: "112",
      os: 'Windows',
      os_version: 10
    },
    bs_safari_oldest_supported: {
      base: 'BrowserStack',
      browser: "Safari",
      browser_version: "16",
      os: 'OS X',
      os_version: 'Big Sur'
    },
    bs_safari_latest_supported: {
      base: 'BrowserStack',
      browser: "Safari",
      browser_version: "16",
      os: 'OS X',
      os_version: 'Big Sur'
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
