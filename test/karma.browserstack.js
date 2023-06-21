module.exports = {
  browserStack: {
    username: process.env.BROWSER_STACK_USERNAME,
    accessKey: process.env.BROWSER_STACK_ACCESS_KEY,
    timeout: 1800
  },

  customLaunchers: {
    remote_firefox: { 
      base: 'BrowserStack',
      browser: 'firefox',
      browser_version: '114',
      os: 'Windows',
      os_version: 10
    },
    remote_edge: {
      base: 'BrowserStack',
      browser: 'Edge',
      browser_version: '114',
      os: 'Windows',
      os_version: '10'
    },
    remote_chrome: {      
      base: 'BrowserStack',
      browser: "Chrome",
      browser_version: "114",
      os: 'Windows',
      os_version: 10
    },
    remote_safari: {
      base: 'BrowserStack',
      browser: "Safari",
      browser_version: "15",
      os: 'OS X',
      os_version: 'Monterey'
    }
  }
}
