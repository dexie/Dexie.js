/** This module comprises the list of browsers
 * to run tests on depending on environment.
 *
 * Browsers listed here must also be defined in
 * karma.browserstack.js
 */

module.exports = {
    // On developers machines, Chrome is most likely to be installed.
    local: ['Chrome'],

    // When browserstack cannot be used, use local Firefox.
    ciLocal: ['Firefox'],
    
    // Continous Integration on every push to master
    ci: [
        // - Let firefox represent the standard evergreen browser.
        // Leaving out Chrome, since local tests have hopefully already run on it.
        // Chrome will be tested in the pre_npm_publish anyway.
        'bs_firefox_latest_supported', 
        // Internet Explorer - an old beast. Enforces legacy compatibility for every PR!
        'bs_ie11',  
        // Safari 10.1 - another beast. Enforces native Safari support for every PR!
        'bs_iphone7'
    ],

    // Test matrix used before every npm publish.
    pre_npm_publish: [
        'bs_chrome_oldest_supported',
        'bs_chrome_latest_supported',
        'bs_firefox_oldest_supported',
        'bs_firefox_latest_supported',
        'bs_edge_latest_supported', // Know that edge has been sporadically instable. Might be better on Edge 15 or later. Restart of tests often needed.
        //Browserstack seems not to support Safari 10.1 on OS X Sierra. It times out over and over.
        // Skip this. We test Safari 10.1 with "bs_iphone7" instead (working well with BrowserStack)
        //'bs_safari', 

        // Safari 10.1 on iOS 10.3
        "bs_iphone7"
    ]
}
