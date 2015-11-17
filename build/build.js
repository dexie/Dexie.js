var utils = require('./build-utils');

console.log("Building...");

utils.parsePackageVersion()
    .then(version => utils.listSourceFiles()
        .then(files => utils.build(version, files, {
            includeMinified: true,
            includeTypings: true,
            includeES6: true,
            includeGzipped: true
        })))
    .then(()=>console.log("All files successfully built. See dist/*"))
    .catch(err => console.error(err));
