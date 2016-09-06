## Can't find dexie-syncable.js?
Transpiled code (dist version) IS ONLY checked in to
the [releases](https://github.com/dfahlander/Dexie.js/tree/releases/addons/Dexie.Syncable/dist).
branch.

## Download
[unpkg.com/dexie-syncable/dist/dexie-syncable.js](https://unpkg.com/dexie-syncable/dist/dexie-syncable.js)

[unpkg.com/dexie-syncable/dist/dexie-syncable.min.js](https://unpkg.com/dexie-syncable/dist/dexie-syncable.min.js)

[unpkg.com/dexie-syncable/dist/dexie-syncable.js.map](https://unpkg.com/dexie-syncable/dist/dexie-syncable.js.map)

[unpkg.com/dexie-syncable/dist/dexie-syncable.min.js.map](https://unpkg.com/dexie-syncable/dist/dexie-syncable.min.js.map)

## npm
```
npm install dexie-syncable --save
```
## bower
Since Dexie v1.3.4, addons are included in the dexie bower package. 
```
$ bower install dexie --save
$ ls bower_components/dexie/addons/Dexie.Syncable/dist
dexie-syncable.js  dexie-syncable.js.map  dexie-syncable.min.js  dexie-syncable.min.js.map

```
## Or build them yourself...
Fork Dexie.js, then:
```
git clone https://github.com/YOUR-USERNAME/Dexie.js.git
cd Dexie.js
npm install
cd addons/Dexie.Syncable
npm run build       # or npm run watch

```
If you're on windows, you need to use an elevated command prompt of some reason to get `npm install` to work.
