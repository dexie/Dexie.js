const fs = require('fs');
const files = process.argv.slice(2);

function replace(content, replacements) {
    return Object.keys(replacements)
        .reduce((data, needle) =>{
            let replaced = data;
            while (replaced.indexOf(needle) !== -1)
                replaced = replaced.replace(needle, replacements[needle]);
            return replaced;
        }, content);
}

files.forEach(file => {
    let fileContent = fs.readFileSync(file, "utf-8");
    fileContent = replace(fileContent, {
        "{version}": require('../package.json').version,
        "{date}": new Date().toDateString()
    });
    fs.writeFileSync(file, fileContent, "utf-8");    
});
