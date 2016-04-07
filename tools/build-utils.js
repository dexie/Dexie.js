const promisifyAll = require('es6-promisify-all');
const fs = promisifyAll(require('fs'));
const rollup = require('rollup');
const uglify = require("uglify-js");
const babel = require('babel-core');
const zlib = promisifyAll(require('zlib'));
const watch = require('node-watch');
const path = require('path');
const TMPDIR = `${path.parse(__dirname).name}/tmp/`;

export async function build (optionsList) {
    let replacements = {
        "{version}": await parsePackageVersion(),
        "{date}": new Date().toDateString()
    };
    // Create tmp directory
    await mkdir(TMPDIR);
    // Create sub dirs to tmp/
    await Promise.all(
        flatten(
            optionsList.map(options =>
                options.dirs.map(dir =>
                    mkdir(TMPDIR + dir)))
        )
    );

    for (let options of optionsList) {
        // List all source files
        let files = flatten(await Promise.all(options.dirs.map(dir => readdir(dir))));
        // Build them all
        await rebuildFiles(options, replacements, files);
    }
}

export async function rebuildFiles(options, replacements, files) {
    // File exclusions
    let exclusions = flatten(flatten(
        (options.excludes || []).concat( // configured excludes...
            Object.keys(options.bundles).map(
                key => options.bundles[key]) // Output files (like bundle.js)
        )).map(filepath=>[
                filepath,
                `./${filepath}`  // Be insensitive to whether file is referenced with ./ or not.
        ])
    );

    // Run babel on each js file
    files = files
        .filter(file => /\.(js|ts)$/i.test(file))
        .filter(file => exclusions.map(x=>x.replace(/\\/g, '/'))
            .indexOf(file.replace(/\\/g, '/')) === -1); // Insensitive to path separator style (WIN/UX)

    if (files.length === 0)
        return false;

    for (let file of files.filter(file => /\.js$/i.test(file))) {
        console.log(`Babel '${file}'`);
        await babelTransform(file, `${TMPDIR}${file}`);
    }

    // Define bundles config
    let bundles = Object.keys(options.bundles).map(key => {
        let entry = key,
            targets = options.bundles[key];

        return {
            entry: entry,
            rollups: targets.filter(f=>ext(f) === '.js' || ext(f) === '.es6.js').map(f => ({
                entry: `${TMPDIR}${entry}`,
                rollupCfg: {
                    format: ext(f) === '.js' ? 'umd' : 'es6',
                    dest: f,
                    sourceMap: targets.indexOf(f + '.map') !== -1,
                    moduleName: getUmdModuleName(entry)
                },
                file: f,
                map: targets.filter(mapFile => mapFile === f + '.map')[0],
                min: targets.filter(minFile => minFile === minName(f)).map(minFile => ({
                    file: minFile,
                    map: targets.filter(file => file === minFile + '.map')[0],
                    gz: targets.filter(file => file === minFile + '.gz')[0]
                }))[0]
            })),
            dts: targets.filter(f=>ext(f) === '.d.ts')[0],
            targets: targets
        };
    });

    // Execute bundling, minification, gzipping and copying of typings files
    for (let bundleInfo of bundles) {
        await makeBundle(bundleInfo, replacements);
    }

    return true;
}

async function makeBundle (bundleInfo, replacements) {

    // Rollup (if anything to rollup)
    for (let rollupInfo of bundleInfo.rollups) {
        await rollupAndMinify(rollupInfo);
    }

    // Typings (if any .d.ts file to copy)
    if (bundleInfo.dts) {
        await copyFile (bundleInfo.entry, bundleInfo.dts);
    }

    // Replace version, date etc in targets
    if (replacements) {
        await Promise.all(bundleInfo.targets
            .filter (file => /\.(js|ts)$/i.test(file))
            .map(file => replaceInFile(file, replacements)));
    }
}

async function rollupAndMinify(rollupInfo) {
    // Call rollup to generate bundle in memory
    console.log (`Rollup --> ${rollupInfo.file}`);
    let bundle = await rollup.rollup({
        entry: rollupInfo.entry,
        onwarn: msg =>
            !/Treating .* as external dependency/i.test(msg) &&
            console.warn(msg)
    });

    // Write bundle to disk
    await bundle.write(rollupInfo.rollupCfg);

    // Minify
    if (rollupInfo.min) {
        console.log (`Minify --> ${rollupInfo.min.file}`);
        let result = uglify.minify(rollupInfo.file, rollupInfo.map && rollupInfo.min.map  ? {
            inSourceMap: rollupInfo.map,
            outSourceMap: rollupInfo.min.map
        } : {});

        // min.js
        await writeFile(rollupInfo.min.file, result.code);

        // min.js.map
        if (rollupInfo.min.map)
            await writeFile(rollupInfo.min.map, result.map);

        // min.js.gz
        if (rollupInfo.min.gz)
            await gzip(rollupInfo.min.file, rollupInfo.min.gz);

    }
}


export async function buildAndWatch (optionsList) {
    let version = await parsePackageVersion();

    await build(optionsList, {
        "{version}": version,
        "{date}": new Date().toDateString()
    });

    for (let o of optionsList) {
        let options = o;
        watch(options.dirs, throttle(50, async function (calls) {
            try {
                let filenames = calls.map(args => args[0])
                    .filter(filename => filename)
                    .filter(filename => /\.(js|ts)$/i.test(filename))
                    .reduce((p, c) =>(p[c] = true, p), {});

                let changedFiles = Object.keys(filenames);
                if (changedFiles.length > 0) {
                    let anythingRebuilt = await rebuildFiles(options, {
                        "{version}": version,
                        "{date}": new Date().toDateString()
                    }, changedFiles);

                    if (anythingRebuilt)
                        console.log("Done. Still watching...");
                }
            } catch (err) {
                console.error("Failed rebuilding: " + err.stack);
            }
        }));
    }
}

export async function gzip(source, destination) {
    let content = await readFile(source);
    let gzipped = await zlib.gzipAsync(content);
    await fs.writeFileAsync(destination, gzipped);
}

export function babelTransform(source, destination) {
    return new Promise((resolve, reject) => {
        let options = {
            compact: false,
            comments: true,
            babelrc: false,
            presets: [],
            plugins: [
                //
                // Select which plugins from "babel-preset-es2015" that we want:
                //
                "transform-es2015-arrow-functions",
                "transform-es2015-block-scoped-functions",
                "transform-es2015-block-scoping",
                "transform-es2015-classes",
                "transform-es2015-computed-properties",
                //"transform-es2015-constants",
                //"transform-es2015-destructuring",
                //"transform-es2015-for-of",
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

export function copyFile(source, target) {
    console.log('Copying '+source+' => \t'+target);
    return new Promise(function (resolve, reject) {
        let rd = fs.createReadStream(source);
        rd.on("error", function (err) {
            reject(err);
        });
        let wr = fs.createWriteStream(target);
        wr.on("error", function (err) {
            reject(err);
        });
        wr.on("close", function () {
            resolve();
        });
        rd.pipe(wr);
    });
}

export function readFile(filename) {
    return fs.readFileAsync(filename, "utf-8");
}

export function writeFile(filename, data) {
    return fs.writeFileAsync(filename, data);
}

export function parsePackageVersion() {
    return readFile('package.json').then(data => JSON.parse(data).version);
}

function replace(content, replacements) {
    return Object.keys(replacements)
        .reduce((data, needle) =>{
            let replaced = data;
            while (replaced.indexOf(needle) !== -1)
                replaced = replaced.replace(needle, replacements[needle]);
            return replaced;
        }, content);
}

export async function replaceInFile(filename, replacements) {
    let content = await readFile(filename);
    let replacedContent = replace(content, replacements);
    if (replacedContent !== content)
        await writeFile(filename, replacedContent);
}

export async function readdir(dir) {
    let files = await fs.readdirAsync(dir);
    return files.map(file => dir + file);
}

function flatten (arrays) {
    return [].concat.apply([], arrays);
}

function fileExists (file) {
    return new Promise(resolve => fs.exists(file, resolve));
}

async function mkdir (dir) {
    if (!await fileExists(dir))
        await fs.mkdirAsync(dir);
}

function ext(filename) {
    let dot = filename.indexOf('.');
    return dot === -1 ?
        filename.toLowerCase() :
        filename.substr(dot).toLowerCase();
}

function minName (jsFile) {
    if (!/\.js$/i.test(jsFile))
        throw new Error ("Not a JS file");

    return jsFile.substr(0, jsFile.length - ".js".length) + ".min.js";
}

function getUmdModuleName(filepath) {
    // "Dexie.js" --> "Dexie"
    // "Dexie.Observable.js" --> "Dexie.Observable"
    let filename = filepath.split('/').reverse()[0];
    let split = filename.split('.');
    split.pop();
    return split.join('.');
}

function throttle(millisecs, cb) {
    let tHandle = null;
    let calls = [];
    let ongoingCallback = false;

    function onTimeout() {
        tHandle = null;
        ongoingCallback = false;
        let callsClone = calls.slice(0);
        calls = [];
        if (callsClone.length === 0) {
            return;
        }
        ongoingCallback = true;
        Promise.resolve()
            .then(() => cb(callsClone))
            .catch(e => console.error(e))
            .then(onTimeout); // Re-check if events occurred during the execution of the callback
    }
    return function () {
        let args = [].slice.call(arguments);
        calls.push(args);
        if (!ongoingCallback) {
            if (tHandle) clearTimeout(tHandle);
            tHandle = setTimeout(onTimeout, millisecs);
        }
    }
}
