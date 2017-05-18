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
        'bs_firefox_latest_supported',
        'bs_ie11'
    ],

    // Test matrix used before every npm publish.
    pre_npm_publish: [
        'bs_chrome_oldest_supported',
        'bs_chrome_latest_supported',
        'bs_firefox_oldest_supported',
        'bs_firefox_latest_supported',
        'bs_edge_latest_supported' // Know that edge has been sporadically instable. Might be better on Edge 15 or later. Restart of tests often needed.
    ]
}
