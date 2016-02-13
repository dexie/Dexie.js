var fs = require('fs');
var utils = require('./build-utils');

utils.parsePackageVersion().then(version => utils.listSourceFiles().then(files => {
    console.log("Building dist/dexie.js...");
    utils.build(version, files).then(() => {
        console.log("Done. Now watching src/* for changes...");
        fs.watch("src", utils.throttle(50, calls => {
            var filenames = calls.map(args => args[1])
                .filter(filename => filename)
                .filter(filename => filename.toLowerCase().endsWith('.js'))
                .reduce((p, c) =>(p[c] = true, p), {});
           
            var changedFiles = Object.keys(filenames);
            if (changedFiles.length > 0) {
                changedFiles.forEach(filename => console.log("Changed file: " + filename));
                return utils.build(version, changedFiles)
                    .then(() =>console.log("Done rebuilding dist/dexie.js and dist/dexie.es6.js"))
                    .catch(e => console.error("Failed rebuilding: " + e.stack));
            }
        }));
    }).catch(err=> {
        console.error("Failed to build: " + err.stack);
    });
}));
