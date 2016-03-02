import {build, parsePackageVersion} from './build-utils';

console.log("Building...");

parsePackageVersion().then(version =>
    build([{
        dirs: ["src/"],
        bundles: {
            "src/Dexie.js": [
                "dist/dexie.js",
                "dist/dexie.js.map",
                "dist/dexie.min.js",
                "dist/dexie.min.js.map",
                "dist/dexie.min.js.gz",
                "dist/dexie.es6.js",
                "dist/dexie.es6.js.map"
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
    }], {
        "{version}": version,
        "{date}": new Date().toDateString()
    }))

    .then(()=>console.log("All files successfully build. See dist/*"))

    .catch(err => console.error(err));
