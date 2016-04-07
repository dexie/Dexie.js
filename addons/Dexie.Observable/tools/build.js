import {build} from '../../../tools/build-utils';

console.log("Building...");

build([{
    dirs: ["src/"],
    bundles: {
        "src/Dexie.Observable.js": [
            "dist/dexie-observable.js",
            "dist/dexie-observable.js.map",
            "dist/dexie-observable.min.js",
            "dist/dexie-observable.min.js.map"
        ]
    }
}]).then(()=> {
    console.log("All files successfully built.");
}).catch(err => {
    console.error(err);
    process.exit(1);
});
