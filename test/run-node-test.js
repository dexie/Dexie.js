// This script is meant to be run by run-node-tests.js, once for each test
// file that should be executed.
const path = require('path')
const fs = require('fs')

const testFile = process.argv[2]

function info (message) { console.log (message) }

info('# ########################################')
info(`# ${testFile}`)
info('# ########################################')

let tests = fs.readFileSync(path.join(__dirname, testFile), 'utf-8')
tests = tests.replace(/^\uFEFF/, '')                        // Strip BOM.
tests = tests.replace(/^import .*?$/gm, '')                 // Strip import statements.
tests = tests.replace(/module[/s]*?\(/gm, 'qUnitModule(')   // Transform module( => qUnitModule(.

//
// Patch IndexedDB and the tests for the Node environment.
//

var QUnit = require('qunitjs')
var qunitTap = require('qunit-tap');
qunitTap(QUnit, function () { console.log.apply(console, arguments) })
QUnit.config.autorun = false
QUnit.config.testTimeout = 3000

const Dexie = require('../dist/dexie.js')

// Add IndexedDBShim
const setGlobalVars = require('indexeddbshim')
const shim = {}
setGlobalVars(shim, {checkOrigin: false})
const { indexedDB, IDBKeyRange } = shim

Dexie.dependencies.indexedDB = indexedDB
Dexie.dependencies.IDBKeyRange = IDBKeyRange

const qUnitModule = require('qunitjs').module                                                           // eslint-disable-line no-unused-vars
const {stop, start, asyncTest, test, equal, ok} = require('qunitjs')                                          // eslint-disable-line no-unused-vars
const {promisedTest, spawnedTest, supports, resetDatabase} = require('./dexie-unittest-utils-node.js')  // eslint-disable-line no-unused-vars

// Monkey patch the test of IndexedDB and promises (node has promises and we just included the IndexedDBShim).
async function isIdbAndPromiseCompatible () { return Promise.resolve(true) }

// Since Node.js doesn’t have native Blob or FileReader support, use polyfills.
const Blob = require('w3c-blob')
const FileReader = require('filereader')

// Run the tests.

eval(tests) // eslint-disable-line no-eval

QUnit.load()
