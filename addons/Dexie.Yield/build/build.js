var utils = require('../../../build/build-utils');

console.log("Building...");

utils.build("", ["dexie-yield.js"], { includeMinified: true, includeES6: true })
    .then(() => console.log("Done."))
    .catch(e => console.error(e));

