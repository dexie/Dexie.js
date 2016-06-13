# [Electron is awesome!](http://electron.atom.io)
It enables you to build portable desktop apps like `#slack`, `atom` and `visual studio code`.

Even more awesome when using the built-in standard indexedDB database via Dexie.js.

Here is just very simple sample to use Dexie to persist your app data in offline Electron apps.

### [main.js](https://github.com/dfahlander/Dexie.js/blob/master/samples/electron/main.js)

..is just a cut'n'paste from [electron's get started sample](https://github.com/electron/electron/blob/master/docs/tutorial/quick-start.md#write-your-first-electron-app)

### [index.html](https://github.com/dfahlander/Dexie.js/blob/master/samples/electron/index.html)

..is (almost) just a cut'n'paste from [Dexie's ES6 sample](https://github.com/dfahlander/Dexie.js#hello-world-es2015--es6).

Note: This sample sets `Dexie.debug = true;`. Read more about [Dexie.debug](https://github.com/dfahlander/Dexie.js/wiki/Dexie.debug) if you like, and how to automate that in a build step.


### No build steps

* No need for a transpilation step because Electron's chromium version already understand most of ES6.
* No need for a bundling step because Electron's web pages has native window.require().

Like. It. a. Lot!

## Usage
```
npm install
npm start
```

No prerequisits. Well, you need a computer. And nodejs of course. Electron is installed with the dependencies.

