import {build} from './build-utils';

console.log("Building...");

build([{
    //
    // Dexie.js
    //
    dirs: ["src/"],
    bundles: {
        "src/Dexie.js": [
            "dist/dexie.js",
            "dist/dexie.js.map",
            "dist/dexie.min.js",
            "dist/dexie.min.js.map",
            "dist/dexie.min.js.gz"
        ],
        "src/Dexie.d.ts": [
            "dist/dexie.d.ts"
        ]
    }
},{
    //
    // Tests
    //
    dirs: ["test/"],
    bundles: {
        "test/tests-all.js": [
            "test/bundle.js",
            "test/bundle.js.map"
        ]
    },
    excludes: [
        "test/worker.js",
        "test/karma-env.js",
        "test/karma.conf.js",
        "test/require.js",
        "test/qunit.js"
    ]
}]).then(()=> {
    console.log("All files successfully built.");
}).catch(err => {
    console.error(err);
    process.exit(1);
});
