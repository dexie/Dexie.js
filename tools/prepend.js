const fs = require('fs');
const [file, prepentionFile] = process.argv.slice(2);

const prepention = fs.readFileSync(prepentionFile);
const fileContent = fs.readFileSync(file);

const fd = fs.openSync(file, 'w');
try {
    fs.writeSync(fd, prepention);
    fs.writeSync(fd, fileContent);
} finally {
    fs.closeSync(fd);
}
