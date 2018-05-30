const path = require("path");
const fs = require("fs");
const util = require("util");
const glob = util.promisify(require("glob"));
const childProcess = require("child-process-es6-promise");

// Shorthand for console.log.
function info(message) {
    console.log(message);
}

// Extract the list of tests from the tests-all.js file.
function allTests() {
    const tranformations = [
        { find: /^\uFEFF/, replace: "" }, // Remove BOM symbol
        { find: /import "\.\/(.*?)";/g, replace: "$1" }, // Remove the import "…" shell
        { find: /\/\/[\s\S]*?$/, replace: "" } // Remove commented-out lines
    ];
    const testsAllJS = fs.readFileSync("./tests-all.js", "utf-8");

    const testFilesString = tranformations.reduce((document, transformation) => {
        return document.replace(transformation.find, transformation.replace);
    }, /* start with */ testsAllJS);

    // Get the list of files as an array, filtering out any empty entries.
    const testFiles = testFilesString.split("\n").filter(i => {
        return i !== "";
    });

    return testFiles;
}

(async function() {
    info("# Preparing Dexie tests for Node.js.");

    // Check if need to run all tests or whether we’ve been asked to run
    // specific test(s). To run specific tests:
    //
    // npm run test:node -- tests-1(.js) tests-2(.js)
    //
    // This will run only tests in test/tests-1.js and test/tests-.js. The
    // file extension is optional and will be added if missing.
    //
    // Note: npm run test:node:pretty does not accept arguments. If you want
    // to pretty print the results of specific tests, manually pipe the result
    // to faucet:
    //
    // e.g., npm run test:node -- tests-table | node_modules/faucet/bin/cmd.js
    // 
    // (Or, if you have faucet installed globally: … | faucet)

    let specificTests = process.argv.splice(2);
    const testFiles = (specificTests.length === 0) ? allTests() : specificTests.map(t => `./${t}.js`.replace('.js.js', '.js'));
    
    info(`# Will run tests:`);
    testFiles.forEach(f => info(`#  - ${f}`));

    info("# Preparing unit test utilities for use in Node.");

    let dexieUnittestUtilsJS = fs
        .readFileSync("./dexie-unittest-utils.js", "utf-8")
        .replace(/^\uFEFF/, "")
        .replace(/^import .*?$/gm, "");

    // Find exported method names and prepare the module.exports statement for the
    // Node.js version of dexie-unit-test-utils.js
    const exportedMethodNameRegex = /export function[\s]*?([\S]*?)([\s]*?)\(/gm;
    const matches = [];
    let match = exportedMethodNameRegex.exec(dexieUnittestUtilsJS);
    while (match !== null) {
        matches.push(match[1]);
        match = exportedMethodNameRegex.exec(dexieUnittestUtilsJS);
    }
    const moduleExportsStatement = matches
        .reduce((moduleExportsStatement, currentMethodName) => {
            return `${moduleExportsStatement} ${currentMethodName}, `;
        }, /* start with */ "module.exports = {")
        .replace(/, $/, " }");

    // Transform: export function => function
    dexieUnittestUtilsJS = dexieUnittestUtilsJS.replace(
        /export function/gm,
        "function"
    );

    // The require statements
    const requireStatements =
        "const Dexie = require('../dist/dexie.js')\nconst {ok, start, test, config} = require('qunitjs')";

    // Add the module.exports statement to the end of the file
    const dexieUnittestUtilsNodeJS = `${requireStatements}\n${dexieUnittestUtilsJS}\n${moduleExportsStatement}\n`;

    // Save the new utilities file temporarily so we can require it later.
    fs.writeFileSync("./dexie-unittest-utils-node.js", dexieUnittestUtilsNodeJS);

    // Run the tests, each one as a separate process so that failures in a specific
    // test do not prevent later tests from running.
    async function runTests() {
        for (let i = 0; i < testFiles.length; i++) {
            try {
                const testFile = testFiles[i];
                const childPromise = childProcess.fork("./run-node-test", [testFile]);
                const child = childPromise.child;
                // Individual test files are given 10 seconds to complete or terminated.
                // (One of the test files is getting stuck at the moment so this allows the
                // rest to run.)
                const timeout = setTimeout(() => {
                    // See http://testanything.org/tap-specification.html#bail-out
                    info(`Bail out! Script timeout.`);
                    child.kill();
                }, 10000);
                await childPromise;
                clearTimeout(timeout);
            } catch (error) {
                console.log(error);
            }
        }
    }

    await runTests();

    info("# ##############");
    info("# All tests run.");
    info("# ##############");

    // Clean up
    fs.unlinkSync("./dexie-unittest-utils-node.js");
    const databases = await glob("D_*");
    for (let i = 0; i < databases.length; i++) {
        fs.unlinkSync(databases[i]);
    }
    fs.unlinkSync("./__sysdb__.sqlite");
})();
