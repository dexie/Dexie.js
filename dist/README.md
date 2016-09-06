## Can't find dexie.js?
Dexie's dist files are no longer checked in to github except temporarily when tagging
a release version (just so that bower will continue to work). The reason for this is because
checking in dist files bloats the commit history and makes it error prone to contribute to the
repo. To support bower though, we have to continue checking in dist files when releasing,
but that is now handled by the release.sh script, who also removes them directly afterwards.

If you still just want to download dexie.js to include in a test HTML page, go
to the following download site:

### Download
[dexie.min.js](https://unpkg.com/dexie/dist/dexie.min.js)

[dexie.min.js.map](https://unpkg.com/dexie/dist/dexie.min.js.map)

### Typings
[dexie.d.ts](https://unpkg.com/dexie/dist/dexie.d.ts)

### Optional Stuff
[dexie.js (non-minified version)](https://unpkg.com/dexie/dist/dexie.js)

[dexie.js.map](https://unpkg.com/dexie/dist/dexie.js.map)

[dexie.min.js.gz (Minified and gzipped)](https://unpkg.com/dexie/dist/dexie.min.js.gz)

## Install from NPM
```
npm install dexie --save
```

## Install from bower
```
bower install dexie --save
```

## How to build
1. cd to dexie package
2. npm install
3. npm run build

## Contributing to Dexie.js?

Watch:
```
npm run watch
```

Test:
```
npm test
```
