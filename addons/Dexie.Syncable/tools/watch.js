import {buildAndWatch} from '../../../tools/build-utils';

console.log("Building...");

buildAndWatch([{
    dirs: ["src/"],
    bundles: {
        "src/Dexie.Syncable.js": [
            "dist/dexie-syncable.js",
            "dist/dexie-syncable.js.map",
            "dist/dexie-syncable.min.js",
            "dist/dexie-syncable.min.js.map"
        ]
    }
}]).then(()=> {
    console.log("All files successfully built. Now watching...");
}).catch(err => {
    console.error(err);
});
