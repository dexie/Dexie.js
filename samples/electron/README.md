# [Electron is awesome!](http://electron.atom.io)
It enables you to build portable desktop apps like `#slack`, `atom` and `visual studio code` with a breeze.

Even more awesome with a local database.

This is just an extremely simple sample to use Dexie to persist your app data locally.

### main.js

..is just a cut'n'paste from [electron's get started sample](https://github.com/electron/electron/blob/master/docs/tutorial/quick-start.md#write-your-first-electron-app)

### index.html

..is just a cut'n'paste from [Dexie's ES6 sample](https://github.com/dfahlander/Dexie.js#hello-world-es2015--es6).


### No build steps

* No need for transpilation because Electron's chromium version alread understand most ES6.
* No need for bundling because Electron's web pages has native window.require().

Like. It. a. Lot!

## Usage
```
npm install
npm start
```

Note: You don't need to have Electron installed to run this sample. It's simply downloaded with `npm install`.

