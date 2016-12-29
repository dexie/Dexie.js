import {build} from '../../../tools/build-utils';

console.log("Building...");

build([{
    dirs: ["src/", "src/hooks/"],
    bundles: {
        "src/Dexie.Observable.js": [
            "dist/dexie-observable.js",
            "dist/dexie-observable.js.map",
            "dist/dexie-observable.min.js",
            "dist/dexie-observable.min.js.map"
        ],
        "src/Dexie.Observable.d.ts": [
            "dist/dexie-observable.d.ts"
        ]
    }
},{
    //
    // Tests
    //
    dirs: ["test/unit/", "test/unit/hooks/"],
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
