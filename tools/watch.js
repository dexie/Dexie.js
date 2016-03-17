import {buildAndWatch} from './build-utils';

console.log("Building...");

buildAndWatch([{

    dirs: ["src/"],
    bundles: {
        "src/Dexie.js": [
            "dist/dexie.js",
            "dist/dexie.js.map"
        ],
        "src/Dexie.d.ts": [
            "dist/dexie.d.ts"
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
    excludes: [
        "test/worker.js",
        "test/karma-env.js",
        "test/karma.conf.js",
        "test/require.js",
        "test/qunit.js"
    ]

}]).then(()=>{
    console.log("Done building. Now watching...")
}).catch(err => {
    console.error(err);
});
