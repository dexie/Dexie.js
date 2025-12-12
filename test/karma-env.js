QUnit.config.autostart = false;
window.workerImports = ['../dist/dexie.js'];
window.workerSource = 'base/test/worker.js';

// QUnit 1.x exports asyncTest, test, etc. as global functions
// but rollup expects them as properties of the QUnit object when using named imports
// Make them accessible both ways
if (typeof asyncTest !== 'undefined' && !QUnit.asyncTest) {
    QUnit.asyncTest = asyncTest;
}
if (typeof test !== 'undefined' && !QUnit.test) {
    QUnit.test = test;
}
if (typeof module !== 'undefined' && !QUnit.module) {
    QUnit.module = module;
}
if (typeof ok !== 'undefined' && !QUnit.ok) {
    QUnit.ok = ok;
}
if (typeof equal !== 'undefined' && !QUnit.equal) {
    QUnit.equal = equal;
}
if (typeof notEqual !== 'undefined' && !QUnit.notEqual) {
    QUnit.notEqual = notEqual;
}
if (typeof deepEqual !== 'undefined' && !QUnit.deepEqual) {
    QUnit.deepEqual = deepEqual;
}
if (typeof notDeepEqual !== 'undefined' && !QUnit.notDeepEqual) {
    QUnit.notDeepEqual = notDeepEqual;
}
if (typeof strictEqual !== 'undefined' && !QUnit.strictEqual) {
    QUnit.strictEqual = strictEqual;
}
if (typeof notStrictEqual !== 'undefined' && !QUnit.notStrictEqual) {
    QUnit.notStrictEqual = notStrictEqual;
}
if (typeof start !== 'undefined' && !QUnit.start) {
    QUnit.start = start;
}
if (typeof stop !== 'undefined' && !QUnit.stop) {
    QUnit.stop = stop;
}
