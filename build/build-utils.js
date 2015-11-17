var fs = require('fs');
var rollup = require('rollup');
var uglify = require("uglify-js");
var babel = require('babel-core');
var zlib = require('zlib');

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

function gzip(source, destination) {
    return readFile(source).then(content => new Promise((resolve, reject) =>
        zlib.gzip(content, (err, data) => err ? reject(err) : resolve(data))
    )).then(gzipped => writeFile(destination, gzipped));
}

function babelTransform(source, destination) {
    return new Promise((resolve, reject) => {
        var options = {
            compact: false,
            comments: true,
            //presets: ["es2015"],
            plugins: [
                //
                // Select which plugins from "babel-preset-es2015" that we want:
                //
                "transform-es2015-arrow-functions",
                "transform-es2015-block-scoped-functions",
                "transform-es2015-block-scoping",
                "transform-es2015-classes",
                "transform-es2015-computed-properties",
                "transform-es2015-constants",
                "transform-es2015-destructuring",
                "transform-es2015-for-of",
                //"transform-es2015-function-name",         // Slightly increases the code size, but could improve debugging experience a bit.
                "transform-es2015-literals",
                //"transform-es2015-modules-commonjs"       // Let rollup fix the moduling instead.
                "transform-es2015-object-super",
                "transform-es2015-parameters",
                "transform-es2015-shorthand-properties",
                "transform-es2015-spread",
                "transform-es2015-sticky-regex",
                "transform-es2015-template-literals",
                //"transform-es2015-typeof-symbol",         // Bloats our code because each time typeof x === 'object' is checked, it needs to polyfill stuff.
                //"transform-es2015-unicode-regex",         // Wont be needed.
                "transform-regenerator"
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
    var ongoingCallback = false;

    function onTimeout() {
        tHandle = null;
        ongoingCallback = false;
        var callsClone = calls.slice(0);
        calls = [];
        if (callsClone.length === 0) {
            return;
        }
        ongoingCallback = true;
        Promise.resolve()
            .then(() => cb(callsClone))
            .catch(e => console.error(e))
            .then(onTimeout);
    }
    return function () {
        var args = [].slice.call(arguments);
        calls.push(args);
        if (!ongoingCallback) {
            if (tHandle) clearTimeout(tHandle);
            tHandle = setTimeout(onTimeout, millisecs);
        }
    }
}

function build(version, files, options) {
    if (!options) options = {};
    try { fs.mkdirSync("tmp"); } catch (e) { }

    var varsToReplace = {
        "{version}": version,
        "{date}": new Date().toDateString()
    };

    return Promise.all(files.map(file => babelTransform("src/" + file, "tmp/" + file)))
    .then(() =>rollup.rollup({ entry: "tmp/Dexie.js" }))

    // Bundle to ES6 Bundle dist/Dexie.es6.js
    .then(bundle =>bundle.write({
        format: 'umd',
        dest: 'dist/dexie.js',
        sourceMap: true,
        moduleName: "Dexie"
    }))

    // Replace {version} and {date}
    .then(() => replaceInFile("dist/dexie.js", varsToReplace))

    // Optional build steps goes here:
    .then(() => {

        // Rollup ES6 sources to a monolit ES6 output "dexie.es6.js"?
        if (options.includeES6) {
            return rollup.rollup({ entry: "src/Dexie.js" }).then(bundle =>
                bundle.write({
                    format: 'es6',
                    dest: 'dist/dexie.es6.js',
                    sourceMap: true
                }))
                .then(() => replaceInFile("dist/dexie.es6.js", varsToReplace));
        }
    })
    .then(() => {

        // Output a minified version of the main output (ES5 UMD module "dexie.min.js")
        if (options.includeMinified) {
            var result = uglify.minify("dist/dexie.js", {
                inSourceMap: "dist/dexie.js.map",
                outSourceMap: "dexie.min.js.map"
            });
            return Promise.all([
                writeFile('dist/dexie.min.js', result.code),
                writeFile('dist/dexie.min.js.map', result.map)
            ]);
        }
    })
    .then(() => {
        if (options.includeGzipped) {
            return gzip('dist/dexie.min.js', 'dist/dexie.min.js.gz');
        }
    })
    .then(() => {

        // Copy Dexie.d.ts as well?
        if (options.includeTypings) {
            return copyFiles({
                "src/Dexie.d.ts": "dist/dexie.d.ts"
            });
        }
    });
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
    babelTransform: babelTransform,
    build: build
};
