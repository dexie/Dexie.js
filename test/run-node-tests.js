const path = require('path')
const fs = require('fs')
const util = require('util');
const glob = util.promisify(require('glob'));
const childProcess = require('child-process-es6-promise')

function info (message) { console.log (message) }

(async function () {
  info('Preparing Dexie tests for Node.js.')

  //
  // Extract the list of tests from the tests-all.js file.
  //
  const tranformations = [
    {find: /^\uFEFF/, replace: ''},                 // Remove BOM symbol
    {find: /import "\.\/(.*?)";/g, replace: "$1"},  // Remove the import "…" shell
    {find: /\/\/[\s\S]*?$/, replace: ''},           // Remove commented-out lines
  ]
  const testsAllJS = fs.readFileSync('./tests-all.js', 'utf-8')

  const testFilesString = tranformations.reduce((document, transformation) => {
    return document.replace(transformation.find, transformation.replace)
  }, /* start with */ testsAllJS)

  // Get the list of files as an array, filtering out any empty entries.
  const testFiles = testFilesString.split('\n').filter((i) => { return i !== '' })

  info('Preparing unit test utilities for use in Node.')

  let dexieUnittestUtilsJS = fs.readFileSync('./dexie-unittest-utils.js', 'utf-8').replace(/^\uFEFF/, '').replace(/^import .*?$/gm, '')

  // Find exported method names and prepare the module.exports statement for the
  // Node.js version of dexie-unit-test-utils.js
  const exportedMethodNameRegex = /export function[\s]*?([\S]*?)([\s]*?)\(/gm
  const matches = []
  let match = exportedMethodNameRegex.exec(dexieUnittestUtilsJS)
  while (match !== null) {
    matches.push(match[1])
    match = exportedMethodNameRegex.exec(dexieUnittestUtilsJS)
  }
  const moduleExportsStatement = (matches.reduce((moduleExportsStatement, currentMethodName) => {
    return `${moduleExportsStatement} ${currentMethodName}, `
  }, /* start with */ 'module.exports = {')).replace(/, $/, ' }')

  // Transform: export function => function
  dexieUnittestUtilsJS = dexieUnittestUtilsJS.replace(/export function/gm, 'function')

  // The require statements
  const requireStatements = "const Dexie = require('../dist/dexie.js')\nconst {ok, start, test, config} = require('qunitjs')"

  // Add the module.exports statement to the end of the file
  const dexieUnittestUtilsNodeJS = `${requireStatements}\n${dexieUnittestUtilsJS}\n${moduleExportsStatement}\n`

  // Save the new utilities file temporarily so we can require it later.
  fs.writeFileSync('./dexie-unittest-utils-node.js', dexieUnittestUtilsNodeJS)

  // Run the tests, each one as a separate process so that failures in a specific
  // test do not prevent later tests from running.
  async function runTests () {
    for (let i = 0; i < testFiles.length; i++) {
      try {
        const testFile = testFiles[i]
        const childPromise = childProcess.fork('./run-node-test', [testFile])
        const child = childPromise.child
        // Individual test files are given 10 seconds to complete or terminated.
        // (One of the test files is getting stuck at the moment so this allows the
        // rest to run.)
        const timeout = setTimeout(() => {
          info(`\n*** Killing test script: ${testFile} ***\n`)
          child.kill()
        }, 10000);
        await childPromise
        clearTimeout(timeout)
      } catch (error) {
        console.log(error)
      }
    }
  }

  await runTests()

  info('All tests run.')

  // Clean up
  fs.unlinkSync('./dexie-unittest-utils-node.js')
  const databases = await glob('D_*')
  for (let i = 0; i < databases.length; i++) {
    fs.unlinkSync(databases[i])
  }
  fs.unlinkSync('./__sysdb__.sqlite')

})()
