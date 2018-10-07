const fs = require('fs');

function getObjectWithoutProperties(obj, keys) {
    let target = {};
    for (let i in obj) {
        if (keys.indexOf(i) >= 0)
            continue;
        if (!Object.prototype.hasOwnProperty.call(obj, i))
            continue;
        target[i] = obj[i];
    } return target;
}


function getNewestFileInDir(dirPath) {
    let audioFilePath = dirPath //Location of recorded audio files
    let files = fs.readdirSync(audioFilePath);
    return getFile(files, audioFilePath);
}

function getFile(files, path) {
    let out = [];
    files.forEach(function (file) {
        let stats = fs.statSync(path + "/" + file);
        if (stats.isFile()) {
            out.push({ "file": file, "mtime": stats.mtime.getTime() });
        }
    });
    out.sort(function (a, b) {
        return b.mtime - a.mtime;
    })
    return (out.length > 0) ? out[0].file : "";
}

module.exports = {
    getObjectWithoutProperties,
    getNewestFileInDir
}