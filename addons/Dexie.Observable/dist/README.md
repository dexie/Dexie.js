## Can't find dexie-observable.js?
Transpiled code (dist version) IS ONLY checked in to
the [releases](https://github.com/dfahlander/Dexie.js/tree/releases/addons/Dexie.Observable/dist)
branch.

## Download
[unpkg.com/dexie-observable/dist/dexie-observable.js](https://unpkg.com/dexie-observable/dist/dexie-observable.js)

[unpkg.com/dexie-observable/dist/dexie-observable.min.js](https://unpkg.com/dexie-observable/dist/dexie-observable.min.js)

[unpkg.com/dexie-observable/dist/dexie-observable.js.map](https://unpkg.com/dexie-observable/dist/dexie-observable.js.map)

[unpkg.com/dexie-observable/dist/dexie-observable.min.js.map](https://unpkg.com/dexie-observable/dist/dexie-observable.min.js.map)

## npm
```
npm install dexie-observable --save
```
## bower
Since Dexie v1.3.4, addons are included in the dexie bower package. 
```
$ bower install dexie --save
$ ls bower_components/dexie/addons/Dexie.Observable/dist
dexie-observable.js  dexie-observable.js.map  dexie-observable.min.js  dexie-observable.min.js.map

```
## Or build them yourself...
Fork Dexie.js, then:
```
git clone https://github.com/YOUR-USERNAME/Dexie.js.git
cd Dexie.js
npm install
cd addons/Dexie.Observable
npm run build       # or npm run watch

```
If you're on windows, you need to use an elevated command prompt of some reason to get `npm install` to work.
