import {build} from '../../../tools/build-utils';

console.log("Building...");

build([{
    dirs: ["src/"],
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
}]).then(()=> {
    console.log("All files successfully built.");
}).catch(err => {
    console.error(err);
    process.exit(1);
});
