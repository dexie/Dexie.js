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
        'bs_firefox',
        'bs_ie11'
    ],

    // Full test matrix. Used before every npm publish.
    full: [
        'bs_chrome',
        'bs_chrome_latest',
        'bs_firefox',
        'bs_firefox_latest',
        'bs_edge_latest', // Know that edge 13 has been sporadically instable. Might be better on Edge 14 or later. Restart of tests often needed.
        'bs_ie11' // Know that IE11 has been sporadically instable. Restart of tests often needed.
    ]
}
