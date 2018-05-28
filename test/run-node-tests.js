const path = require('path')
const fs = require('fs')

function info (message) { console.log (message) }

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
// const testFiles = testFilesString.split('\n').filter((i) => { return i !== '' })

// Debug: start with just tests-table.js
let testFiles = ['./tests-table.js']

info(`Loading ${testFiles.length} tests.`)

const testBundle = testFiles.reduce((testBundle, testFile) => {
  let tests = fs.readFileSync(path.join(__dirname, testFile), 'utf-8')

  tests = tests.replace(/^\uFEFF/, '')                        // Strip BOM
  tests = tests.replace(/^import .*?$/gm, '')                 // Strip import statements
  tests = tests.replace(/module[/s]*?\(/gm, 'qUnitModule(')   // Transform module( => qUnitModule(

  return testBundle += tests
}, /* start with */ '')

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

info('Patching IndexedDB and the tests for the Node environment.')

var QUnit = require('qunitjs')
var qunitTap = require('qunit-tap');
qunitTap(QUnit, function () { console.log.apply(console, arguments) })
QUnit.config.autorun = false

const Dexie = require('../dist/dexie.js')

// Add IndexedDBShim
const setGlobalVars = require('indexeddbshim')
const shim = {}
setGlobalVars(shim, {checkOrigin: false})
const { indexedDB, IDBKeyRange } = shim

Dexie.dependencies.indexedDB = indexedDB
Dexie.dependencies.IDBKeyRange = IDBKeyRange

const qUnitModule = require('qunitjs').module                                                           // eslint-disable-line no-unused-vars
const {stop, start, asyncTest, equal, ok} = require('qunitjs')                                          // eslint-disable-line no-unused-vars
const {promisedTest, spawnedTest, supports, resetDatabase} = require('./dexie-unittest-utils-node.js')  // eslint-disable-line no-unused-vars

info('Running tests…')

eval(testBundle) // eslint-disable-line no-eval

QUnit.load()

// Clean up
fs.unlinkSync('./dexie-unittest-utils-node.js')
