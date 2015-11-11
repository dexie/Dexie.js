var fs = require('fs');
var rollup = require('rollup');
var utils = require('./build-utils');

function rebuild(version) {
    return rollup.rollup({ entry: "src/Dexie.js" })

        // Bundle to ES6 Bundle dist/Dexie.es6.js
        .then(bundle =>bundle.write({
            format: 'es6',
            dest: 'dist/Dexie.es6.js',
            sourceMap: true
        }))

        // Replace {version}
        .then(() => utils.replaceInFile("dist/Dexie.es6.js", { "{version}": version }))

        // Generate dist/Dexie.js (ES5 bundle)
        .then(()=> rollup.rollup({ entry: 'dist/Dexie.es6.js' }))
        .then(bundle => bundle.write({
            format: 'umd',
            dest: 'dist/Dexie.js',
            sourceMap: true,
            moduleName: 'Dexie'
        }));
}

utils.parsePackageVersion().then(version => {
    console.log("Building dist/Dexie.js and dist/Dexie.es6.js...");
    rebuild(version).then(() => {
        console.log("Done. Now watching src/* for changes...");
        fs.watch("src", utils.throttle(50, calls => {
            var filenames = calls.map(args => args[1])
                .filter(filename => filename)
                .filter(filename => filename.toLowerCase().lastIndexOf('.js') === filename.length - ".js".length)
                .reduce((p, c) =>(p[c] = true, p), {});

            if (Object.keys(filenames).length > 0) {
                Object.keys(filenames).forEach(filename => console.log("Changed file: " + filename));
                rebuild(version)
                    .then(() =>console.log("Done rebuilding dist/Dexie.js and dist/Dexie.es6.js"))
                    .catch(e => console.error("Failed rebuilding: " + e.stack));
            }
        }));
    }).catch(err=> {
        console.error("Failed to build: " + err.stack);
    });
});
