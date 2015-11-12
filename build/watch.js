var fs = require('fs');
var rollup = require('rollup');
var utils = require('./build-utils');

process.on('uncaughtException', function (err) {
    console.error(err);
});

function rebuild(version, files) {
    return Promise.all(files.map(file => utils.babelTransform("src/" + file, "tmp/" + file)))
        .then(()=>rollup.rollup({ entry: "tmp/Dexie.js" }))

        // Bundle to ES6 Bundle dist/Dexie.es6.js
        .then(bundle =>bundle.write({
            format: 'umd',
            dest: 'dist/dexie.js',
            sourceMap: true,
            moduleName: "Dexie"
        }))

        // Replace {version}
        .then(() => utils.replaceInFile("dist/dexie.js", { "{version}": version }));
}

utils.parsePackageVersion().then(version => utils.listSourceFiles().then(files => {
    console.log("Building dist/dexie.js...");
    try { fs.mkdirSync("tmp"); } catch (e) { }
    rebuild(version, files).then(() => {
        console.log("Done. Now watching src/* for changes...");
        fs.watch("src", utils.throttle(50, calls => {
            var filenames = calls.map(args => args[1])
                .filter(filename => filename)
                .filter(filename => filename.toLowerCase().endsWith('.js'))
                .reduce((p, c) =>(p[c] = true, p), {});
           
            var changedFiles = Object.keys(filenames);
            if (changedFiles.length > 0) {
                changedFiles.forEach(filename => console.log("Changed file: " + filename));
                rebuild(version, changedFiles)
                    .then(() =>console.log("Done rebuilding dist/dexie.js and dist/dexie.es6.js"))
                    .catch(e => console.error("Failed rebuilding: " + e.stack));
            }
        }));
    }).catch(err=> {
        console.error("Failed to build: " + err.stack);
    });
}));
