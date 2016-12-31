import {build} from '../../../tools/build-utils';

console.log("Building...");

build([{
    dirs: ["src/", "src/get-local-changes-for-node/"],
    bundles: {
        "src/Dexie.Syncable.js": [
            "dist/dexie-syncable.js",
            "dist/dexie-syncable.js.map",
            "dist/dexie-syncable.min.js",
            "dist/dexie-syncable.min.js.map"
        ],
        "src/Dexie.Syncable.d.ts": [
            "dist/dexie-syncable.d.ts"
        ]
    }
},{
    //
    // Tests
    //
    dirs: ["test/unit/", "test/unit/get-local-changes-for-node/"],
    bundles: {
        "test/unit/unit-tests-all.js": [
            "test/unit/bundle.js",
            "test/unit/bundle.js.map"
        ]
    },
    excludes: [
        "test/unit/karma-env.js",
        "test/unit/karma.conf.js"
    ]
}]).then(()=> {
    console.log("All files successfully built.");
}).catch(err => {
    console.error(err);
    process.exit(1);
});
