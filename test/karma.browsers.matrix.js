/** This module comprises the list of browsers
 * to run tests on depending on environment.
 *
 * "remote..." browsers listed here must also be defined in
 * karma.lambdatest.js
 */

module.exports = {
    // On developers machines, Chrome is most likely to be installed.
    local: ['Chrome'],

    // When Lambdatest credentials aren't available, use Chrome and Firefox on Github Actions:
    ciLocal: ['Chrome', 'Firefox'],

    // Continous Integration on every push
    ci: [
        'remote_chrome',
        'remote_safari',
        'remote_firefox'
    ],

    // Test matrix used before every npm publish.
    // Note: The script tools/release.sh will run the tests
    // locally on Chrome. However, this is just an
    // extra safety check as all tests must anyway have been successful
    // on the CI that tests on all configured browsers in Lambdatest.
    pre_npm_publish: [
        'Chrome',
    ]
}

