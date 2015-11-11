var fs = require('fs');
var rollup = require('rollup');
var uglify = require("uglify-js");
var utils = require('./build-utils');

rollup.rollup({ entry: "src/Dexie.js" }).then(bundle => {
    console.log('Writing ES6 bundle to =>\tdist/Dexie.es6.js');
    return bundle.write({
        format: 'es6',
        dest: 'dist/Dexie.es6.js',
        sourceMap: true
    });
}).then(() => utils.parsePackageVersion())
  .then(version => {
     console.log("Replacing {version}=>'"+version+"' =>\tdist/Dexie.es6.js");
     return utils.replaceInFile("dist/Dexie.es6.js", { "{version}": version });
}).then(()=>{
    console.log("Reading ES6 bundle again <= \tdist/Dexie.es6.js");
    return rollup.rollup({entry: 'dist/Dexie.es6.js'});
}).then(bundle => {
    // Generate bundle + sourcemap
    console.log('Writing ES5 bundle to =>\tdist/Dexie.js');
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
    return Promise.all([
        utils.writeFile('dist/Dexie.min.js', result.code),
        utils.writeFile('dist/Dexie.min.js.map', result.map)
    ]);
}).then(()=>utils.copyFiles({
    "src/Dexie.d.ts": "dist/Dexie.d.ts"
})).catch(err => console.error(err));
