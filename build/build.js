var fs = require('fs');
var rollup = require('rollup');
var uglify = require("uglify-js");
var utils = require('./build-utils');

utils.copyFiles({
    "src/Dexie.js": "dist/Dexie.es6.js",
    "src/Dexie.d.ts": "dist/Dexie.d.ts"
}).then(() => {
    console.log("Reading and bundling source <= \tsrc/Dexie.js");
    return rollup.rollup({
        // The bundle's starting point. This file will be
        // included, along with the minimum necessary code
        // from its dependencies
        entry: 'src/Dexie.js'
    });
}).then(bundle => {
    // Generate bundle + sourcemap
    console.log('Writing UMD bundle to =>\tdist/Dexie.js');
    return bundle.write({
        format: 'umd',
        dest: 'dist/Dexie.js',
        sourceMap: true,
        moduleName: 'Dexie',
        sourceMapRelativePaths: true
    });
}).then(() => {
    console.log("Minifying the ES5 UMD bundle =>\tdist/Dexie.min.js, (including .map)");
    var result = uglify.minify("dist/Dexie.js", {
        inSourceMap: "dist/Dexie.js.map",
        outSourceMap: "Dexie.min.js.map"
    });

    fs.writeFileSync('dist/Dexie.min.js', result.code);
    fs.writeFileSync('dist/Dexie.min.js.map', result.map);
}).catch(err => console.error(err));
