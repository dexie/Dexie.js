
const ltBrowsers = {
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
};

const webdriverConfig = {
  hostname: 'hub.lambdatest.com',
  port: 80,
};

const webdriverConfigMobile = {
  hostname: 'mobile-hub.lambdatest.com',
  port: 80,
};

for (const key of Object.keys(ltBrowsers)) {
  ltBrowsers[key].base = 'WebDriver';
  if (ltBrowsers[key].isRealMobile) {
    ltBrowsers[key].config = webdriverConfigMobile;
    ltBrowsers[key].user = process.env.LT_USERNAME;
    ltBrowsers[key].accessKey = process.env.LT_ACCESS_KEY;
    ltBrowsers[key].tunnel = true;
    ltBrowsers[key].console = true;
    ltBrowsers[key].network = true;
    ltBrowsers[key].tunnelName = process.env.LT_TUNNEL_NAME || 'jasmine';
    ltBrowsers[key].pseudoActivityInterval = 5000; // 5000 ms heartbeat
  } else {
    ltBrowsers[key].config = webdriverConfig;
    ltBrowsers[key]['LT:Options'].username = process.env.LT_USERNAME;
    ltBrowsers[key]['LT:Options'].accessKey = process.env.LT_ACCESS_KEY;
    ltBrowsers[key]['LT:Options'].tunnel = true;
    ltBrowsers[key]['LT:Options'].console = true;
    ltBrowsers[key]['LT:Options'].network = true;
    ltBrowsers[key]['LT:Options'].tunnelName =
      process.env.LT_TUNNEL_NAME || 'jasmine';
    ltBrowsers[key]['LT:Options'].pseudoActivityInterval = 5000; // 5000 ms heartbeat
  }

  ltBrowsers[key].retryLimit = 2;
}

function configureLambdaTest(karmaCommon) {
  karmaCommon.hostname = 'localhost.lambdatest.com';
  karmaCommon.customLaunchers = {
    ...karmaCommon.customLaunchers,
    ...ltBrowsers
  }
}

module.exports = {
  configureLambdaTest
}
