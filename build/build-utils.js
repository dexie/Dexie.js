var fs = require('fs');

function copyFile(source, target) {
    console.log('Copying '+source+' => \t'+target);
    return new Promise(function (resolve, reject) {
        var rd = fs.createReadStream(source);
        rd.on("error", function (err) {
            reject(err);
        });
        var wr = fs.createWriteStream(target);
        wr.on("error", function (err) {
            reject(err);
        });
        wr.on("close", function (ex) {
            resolve();
        });
        rd.pipe(wr);
    });
}

function copyFiles (sourcesAndTargets) {
    return Promise.all(
        Object.keys(sourcesAndTargets)
            .map(source => copyFile(source, sourcesAndTargets[source])));
}

module.exports = {
    copyFile: copyFile,
    copyFiles: copyFiles
};
