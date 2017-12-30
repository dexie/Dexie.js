const fs = require('fs');
const path = require('path');
const inputDir = path.resolve(__dirname, '../src/public/types');
const ouputFilePath = path.resolve(__dirname, '../dist/dexie.d.ts');

const files = fs.readdirSync(inputDir).filter (file => file.endsWith('.d.ts'))
  .map(filename => path.resolve(__dirname, '../src/public/types/', filename));
const fileContents = files.map(file => fs.readFileSync(file, "utf-8")).join('\n');
const lines = fileContents
  .split('\n')
  .filter(line => line.indexOf('import ') !== 0);

const exportedGenerics = lines
  .map(line => /export\s(interface|type)\s([a-zA-Z0-9-_]+\<(.*)\>)\s/.exec(line))
  .filter(lineMatches => !!lineMatches)
  .map(lineMatches => lineMatches[2])
  .map(generic => {
    let level = 0;
    for (var i=0; i<generic.length; ++i) {
      if (generic[i] === '<') ++level;
      else if (generic[i] === '>') {
        --level;
        if (level === 0) return generic.substr(0, i + 1);
      }
    }
    return generic + ">";})
  .map(generic => {
    const name = generic.substr(0, generic.indexOf('<'));
    const paramNames = /\<(.*)\>/.exec(generic)[1].split(',')
      .map(param => /[a-zA-Z0-9-_]+/.exec(param)[0]);
    console.log(paramNames);
    return {
      fullParams: generic,
      paramNames: `${name}<${paramNames.join(',')}>`
    };
  });

const exportedNonGenerics = lines
  .map(line => /export\s(interface|type)\s([a-zA-Z0-9-_]+[^\<])\s/.exec(line))
  .filter(lineMatches => !!lineMatches)
  .map(lineMatches => lineMatches[2])

const result = `
declare module Dexie {
${lines.join('\n')}
}

${exportedNonGenerics.map(type => `export type ${type}=Dexie.${type};`).join('\n')}
${exportedGenerics.map(type => `export type ${type.fullParams}=Dexie.${type.paramNames};`).join('\n')}

declare var Dexie: DexieConstructor;

export default Dexie;
`;

fs.writeFileSync(ouputFilePath, result);
//console.log(result);