import {DexieBuildOptions, buildAndWatch, parsePackageVersion} from './build-utils';

var fs = require('fs');

console.log("Building...");

parsePackageVersion()
    .then(version => buildAndWatch([{
        dirs: ["src/"],
        bundles: {
            "src/Dexie.js": [
                "dist/dexie.js",
                "dist/dexie.js.map"
            ]
        }
    },{
        dirs: ["test/"],
        bundles: {
            "test/tests-all.js": [
                "test/bundle.js",
                "test/bundle.js.map"
            ]
        },
        excludes: ["test/worker.js", "test/karma-env.js", "test/require.js", "test/qunit.js"]
    }], version))
    .then(()=>console.log("Done building. Now watching..."))
    .catch(err => {
        console.error(err);
    });
