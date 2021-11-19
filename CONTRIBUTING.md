HOW TO CONTRIBUTE
=================

We appreciate contributions in forms of:

* issues
* help answering questions in [issues](https://github.com/dfahlander/Dexie.js/issues) and on [stackoverflow](https://stackexchange.com/filters/233583/dexie-stackoverflow)
* fixing bugs via pull-requests
* developing addons or other [derived work](https://dexie.org/docs/DerivedWork)
* promoting Dexie.js
* sharing ideas

Contribute while developing your own app
========================================

Here is a little cheat-sheet for how to symlink your app's `node_modules/dexie` to a place where you can edit the source, version control your changes and create pull requests back to Dexie. Assuming you've already ran `npm install dexie --save` for the app your are developing.

1. Fork Dexie.js from the web gui on github
2. Clone your fork locally by launching a shell/command window and cd to a neutral place (like `~repos/`, `c:\repos` or whatever)
3. Run the following commands:

    ```
    git clone https://github.com/YOUR-USERNAME/Dexie.js.git dexie
    cd dexie
    npm install
    npm run build
    npm link
    ```
3. cd to your app directory and write:
    ```
    npm link dexie
    ```

Your app's `node_modules/dexie/` is now sym-linked to the Dexie.js clone on your hard drive so any change you do there will propagate to your app. Build dexie.js using `npm run build` or `npm run watch`. The latter will react on any source file change and rebuild the dist files.

That's it. Now you're up and running to test and commit changes to files under dexie/src/* or dexie/test/* and the changes will instantly affect the app you are developing.

Pull requests are more than welcome. Some advices are:

* Run npm test before making a pull request.
* If you find an issue, a unit test that reproduces it is lovely ;). If you don't know where to put it, put it in `test/tests-misc.js`. We use qunit. Just look at existing tests in `tests-misc.js` to see how they should be written. Tests are transpiled in the build script so you can use ES6 if you like.

Build
-----
```
npm install
npm run build
```

Test
----
```
npm test
```

Watch
-----
```
npm run watch
```
