// workerImports will be used by tests-open.js in the dexie test suite when
// launching a Worker. This line will instruct the worker to import dexie-observable
// and dexie-syncable.
window.workerImports.push("../addons/Dexie.Observable/dist/dexie-observable.js");
window.workerImports.push("../addons/Dexie.Syncable/dist/dexie-syncable.js");
