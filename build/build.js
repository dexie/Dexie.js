var fs = require('fs');
var rollup = require('rollup');
var uglify = require("uglify-js");

copyFile("src/Dexie.js", "dist/latest/Dexie.es6.js", function (err) {
    if (err) {
        console.error(err);
        return;
    }
    rollup.rollup({
        // The bundle's starting point. This file will be
        // included, along with the minimum necessary code
        // from its dependencies
        entry: 'src/Dexie.js'
    }).then(function (bundle) {
        // Generate bundle + sourcemap
        return bundle.write({
            format: 'umd',
            dest: 'dist/latest/Dexie.js',
            sourceMap: true,
            moduleName: 'Dexie',
            sourceMapRelativePaths: true
        });
    }).then(function () {
        console.log("dsd222");
        var result = uglify.minify("dist/latest/Dexie.js", {
            inSourceMap: "dist/latest/Dexie.js.map",
            outSourceMap: "Dexie.min.js.map"
        });
        console.log("slkajfk");
        //console.log("Hello" + result.code);
        fs.writeFileSync('dist/latest/Dexie.min.js', result.code);
        console.log("slkajfk 222");
        fs.writeFileSync('dist/latest/Dexie.min.js.map', result.map);
        console.log("slkajfk 33");
    }).catch(function (err) {
        console.error(err);
    });
});

function copyFile(source, target, cb) {
    var cbCalled = false;

    var rd = fs.createReadStream(source);
    rd.on("error", function (err) {
        done(err);
    });
    var wr = fs.createWriteStream(target);
    wr.on("error", function (err) {
        done(err);
    });
    wr.on("close", function (ex) {
        done();
    });
    rd.pipe(wr);

    function done(err) {
        if (!cbCalled) {
            cb(err);
            cbCalled = true;
        }
    }
}