var fs = require('fs');

function copyFile(source, target) {
    console.log('Copying '+source+' => \t'+target);
    return new Promise(function (resolve, reject) {
        var rd = fs.createReadStream(source);
        rd.on("error", function (err) {
            reject(err);
        });
        var wr = fs.createWriteStream(target);
        wr.on("error", function (err) {
            reject(err);
        });
        wr.on("close", function (ex) {
            resolve();
        });
        rd.pipe(wr);
    });
}

function copyFiles (sourcesAndTargets) {
    return Promise.all(
        Object.keys(sourcesAndTargets)
            .map(source => copyFile(source, sourcesAndTargets[source])));
}

function readFile(filename) {
    return new Promise((resolve, reject) =>
        fs.readFile(filename, "utf-8", (err, data) => err ? reject(err) : resolve(data)));
}

function writeFile(filename, data) {
    return new Promise((resolve, reject) =>
        fs.writeFile(filename, data, err => err ? reject(err) : resolve()));
}

function parsePackageVersion() {
    return readFile('package.json').then(data => JSON.parse(data).version);
}

function replace(content, replacements) {
    return Object.keys(replacements)
        .reduce((data, needle) =>{
            var replaced = data;
            while (replaced.indexOf(needle) !== -1)
                replaced = replaced.replace(needle, replacements[needle]);
            return replaced;
        }, content);
}

function replaceInFile(filename, replacements) {
    return readFile(filename)
        .then(content => replace(content, replacements))
        .then(replacedContent => writeFile(filename, replacedContent));
}

function throttle(millisecs, cb) {
    var tHandle = null;
    var calls = [];

    function onTimeout() {
        tHandle = null;
        cb(calls);
    }
    return function () {
        var args = [].slice.call(arguments);
        calls.push(args);
        if (tHandle) clearTimeout(tHandle);
        tHandle = setTimeout(onTimeout, millisecs);
    }
}

module.exports = {
    copyFile: copyFile,
    copyFiles: copyFiles,
    readFile: readFile,
    writeFile: writeFile,
    parsePackageVersion: parsePackageVersion,
    replace: replace,
    replaceInFile: replaceInFile,
    throttle: throttle
};
