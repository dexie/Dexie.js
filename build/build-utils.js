var fs = require('fs');
var babel = require('babel-core');

function listSourceFiles() {
    return new Promise((resolve, reject) => {
        fs.readdir('src/', (err, files) => {
            if (err)
                reject(err);
            else
                resolve(files.filter(f=>f.toLowerCase().endsWith('.js')));
        });
    });
}

function babelTransform(source, destination) {
    return new Promise((resolve, reject) => {
        var options = {
            //sourceMaps: true,
            //inputSourceMap: inSourceMap,
            compact: false,
            comments: true,
            //presets: ["es2015"],
            plugins: [
                "transform-es2015-arrow-functions",
                "transform-es2015-block-scoped-functions",
                "transform-es2015-block-scoping",
                "transform-es2015-classes",
                "transform-es2015-computed-properties",
                "transform-es2015-constants",
                //"transform-es2015-destructuring",
                //"transform-es2015-for-of",
                //"transform-es2015-function-name",
                "transform-es2015-literals",
                //"transform-es2015-modules-commonjs"  Replaced with "es2015-modules-umd"!
                "transform-es2015-object-super",
                "transform-es2015-parameters",
                "transform-es2015-shorthand-properties",
                "transform-es2015-spread",
                //"transform-es2015-sticky-regex",
                "transform-es2015-template-literals",
                //"transform-es2015-typeof-symbol",
                //"transform-es2015-unicode-regex",
                "transform-regenerator",
                //"transform-es2015-modules-systemjs"
                //"transform-es2015-modules-umd",
            ]
        };
        babel.transformFile(source, options, (err, result) => {
            if (err) return reject(err);
            Promise.all([
                writeFile(destination, result.code),
                writeFile(destination + ".map", result.map)
            ]).then(resolve, reject);
        });
    });
}

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
    throttle: throttle,
    listSourceFiles: listSourceFiles,
    babelTransform: babelTransform
};
