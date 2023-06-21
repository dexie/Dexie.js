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

    // When Lambdatest credentials aren't available, use Chrome and Firefox on Github Actions:
    ciLocal: ['Chrome', 'Firefox'],

    // Continous Integration on every push
    ci: [
        //'remote_chrome',
        'remote_safari',
        //'remote_firefox'
    ],

    // Test matrix used before every npm publish.
    pre_npm_publish: [
        'remote_chrome',
        'remote_edge',
        'remote_safari',
        'remote_firefox'
    ]
}

