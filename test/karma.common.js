/* Base karma configurations to require and extend from other karma.conf.js
*/

const browserSuiteToUse = process.env.TRAVIS ?
  isNaN(process.env.TRAVIS_PULL_REQUEST) && process.env.BROWSER_STACK_USERNAME ?
    "ci" :             // CI pushs to master
    "ciLocal" :        // CI pull request or has no browserstack credentials.
    process.env.NPM_PUBLISH === 'true' ?
      "full" :         // npm publish should test against the full suite of browsers
      "local";         // Local test

console.log("browser-suite: " + browserSuiteToUse);

module.exports = {
  frameworks: [
    'qunit'
  ],

  reporters: [
    'mocha'
  ],

  client: {
    captureConsole: false
  },

  port: 19144,
  
  colors: true,

  browserNoActivityTimeout: 3 * 60 * 1000,

  plugins: [
    'karma-qunit',
    'karma-mocha-reporter',
    'karma-chrome-launcher',
    'karma-firefox-launcher',
    'karma-browserstack-launcher',
  ],

  files: [
    'test/babel-polyfill/polyfill.min.js',
    'node_modules/qunitjs/qunit/qunit.js',
    'test/karma-env.js',
    { pattern: 'test/worker.js', watched: true, included: false, served: true },
    { pattern: '!(node_modules|tmp)*/*.map', watched: false, included: false, served: true}
  ],
  
  browserStack: require('./karma.browserstack.js').browserStack,

  customLaunchers: require('./karma.browserstack.js').customLaunchers,

  browsers: require ('./karma.browsers.matrix')[browserSuiteToUse]
}

