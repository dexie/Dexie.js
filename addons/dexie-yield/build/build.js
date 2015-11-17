var utils = require('../../../build/build-utils');
var rollup = require('rollup');

console.log("Building...");

rollup.rollup({

    entry: "src/dexie-yield.js",
    external: ["dexie"]

}).then(bundle => {

    bundle.write({
        format: 'umd',
        dest: 'dist/dexie-yield.js',
        sourceMap: true,
        moduleName: "Dexie.Yield"
    });

}).then(() => {

    return utils.copyFile("src/dexie-yield.js", "dist/dexie-yield.es6.js");

}).then(() => {

    console.log("Done.");

}).catch(e => {

    console.error(e + ": " + e.stack);

});
