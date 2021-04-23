/** This module comprises the list of browsers
 * to run tests on depending on environment.
 *
 * Browsers listed here must also be defined in
 * karma.browserstack.js
 */

module.exports = {
    // On developers machines, Chrome is most likely to be installed.
    local: ['Chrome'],
    //local: ['bs_safari_latest_supported'],

    // When browserstack cannot be used, use local Firefox.
    ciLocal: ['Firefox'],
    
    // Continous Integration on every push to master
    ci: [
        // - Let firefox represent the standard evergreen browser.
        // Leaving out Chrome, since local tests have hopefully already run on it.
        // Chrome will be tested in the pre_npm_publish anyway.
        'bs_firefox_latest_supported', 
        // Internet Explorer - an old beast. Enforces legacy compatibility for every PR.
        'bs_ie11', // This is causing a lot of trouble.
        // Safari. Enforces native Safari support for every PR!
        'bs_safari_latest_supported'
    ],

    // Test matrix used before every npm publish.
    pre_npm_publish: [
        'bs_chrome_oldest_supported', // ...because not tested in CI!
        'bs_chrome_latest_supported', // ...because not tested in CI!
        'bs_firefox_oldest_supported', // ...because not tested in CI!
        "bs_safari_oldest_supported", // ...because not tested in CI!
    ]
}
