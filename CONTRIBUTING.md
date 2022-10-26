HOW TO CONTRIBUTE
=================

We appreciate contributions in forms of:

* issues
* help answering questions in [issues](https://github.com/dexie/Dexie.js/issues) and on [stackoverflow](https://stackexchange.com/filters/233583/dexie-stackoverflow)
* fixing bugs via pull-requests
* developing addons or other [derived work](https://dexie.org/docs/DerivedWork)
* promoting Dexie.js
* sharing ideas

Contribute while developing your own app
========================================

Dexie uses pnpm package manager. Refer to [pnpm.io/installation](https://pnpm.io/installation) for how to install pnpm.

Here is a little cheat-sheet for how to symlink your app's `node_modules/dexie` to a place where you can edit the source, version control your changes and create pull requests back to Dexie. Assuming you've already ran `npm install dexie` for the app your are developing.

1. Fork Dexie.js from the web gui on github
2. Clone your fork locally by launching a shell/command window and cd to a neutral place (like `~repos/`, `c:\repos` or whatever)
3. Run the following commands:

    ```
    git clone https://github.com/YOUR-USERNAME/Dexie.js.git dexie
    cd dexie
    pnpm install
    pnpm run build
    npm link # Or yarn link or pnpm link --global depending on what package manager you are using.
    ```
3. cd to your app directory and write:
    ```
    npm link dexie # Or yarn link dexie / pnpm link dexie depending on your package manager.
    ```

Your app's `node_modules/dexie/` is now sym-linked to the Dexie.js clone on your hard drive so any change you do there will propagate to your app. Build dexie.js using `pnpm run build` or `pnpm run watch`. The latter will react on any source file change and rebuild the dist files.

That's it. Now you're up and running to test and commit changes to files under dexie/src/* or dexie/test/* and the changes will instantly affect the app you are developing.

If you're on yarn or pnpm, do the same procedures using yarn link / pnpm link.

Pull requests are more than welcome. Some advices are:

* Run pnpm test before making a pull request.
* If you find an issue, a unit test that reproduces it is lovely ;). If you don't know where to put it, put it in `test/tests-misc.js`. We use qunit. Just look at existing tests in `tests-misc.js` to see how they should be written. Tests are transpiled in the build script so you can use ES6 if you like.

Build
-----
```
# To install pnpm, see https://pnpm.io/installation
pnpm install
pnpm run build
```

Test
----
```
pnpm test
```

Watch
-----
```
pnpm run watch
```
