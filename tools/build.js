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
}, {
    //
    // addons/Dexie.Observable
    //
    dirs: ["addons/Dexie.Observable/src"],
    bundles: {
        "addons/Dexie.Observable/src/Dexie.Observable.js": [
            "addons/Dexie.Observable/dist/dexie-observable.js",
            "addons/Dexie.Observable/dist/dexie-observable.js.map",
            "addons/Dexie.Observable/dist/dexie-observable.min.js",
            "addons/Dexie.Observable/dist/dexie-observable.min.js.map"
        ]
    }
}, {
    //
    // addons/Dexie.Syncable
    //
    dirs: ["addons/Dexie.Syncable/src"],
    bundles: {
        "addons/Dexie.Syncable/src/Dexie.Syncable.js": [
            "addons/Dexie.Syncable/dist/dexie-observable.js",
            "addons/Dexie.Syncable/dist/dexie-observable.js.map",
            "addons/Dexie.Syncable/dist/dexie-observable.min.js",
            "addons/Dexie.Syncable/dist/dexie-observable.min.js.map"
        ]
    }
}]).then(()=> {
    console.log("All files successfully built.");
}).catch(err => {
    console.error(err);
});
