const fs = require('fs');
const args = process.argv.slice(2);
const [file, appentionArg] = args.filter(arg => arg[0] !== '-');
const isText = args.some(arg => arg === '--text');

const appention = isText ? appentionArg : fs.readFileSync(appentionArg);

fs.appendFileSync(file, appention);
