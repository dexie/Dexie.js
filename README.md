Dexie.js
========

[![NPM Version][npm-image]][npm-url]

Simple and robust indexedDB wrapper.

 * Minimalistic and straight forward API, easy to use.
 * Code Completion friendly - Your IDE will guide you as you type!
 * Human readable queries: db.friends.where("lastName").anyOf("Helenius", "Fahlander").each(function(friend){...})
 * Bullet proof error handling using transaction scopes
 * The only indexedDB wrapper (so far) to support case insensitive search, set matching and logical OR operations.
 * Promise/A+ compliant
 * Does not hide backend indexedDB from the caller - always possible to reach the backend IDB objects.
 * Performance focused
 * Portable across all browsers:
   * IE10+
   * Chrome
   * Firefox
   * Opera 15+
   * Android browser (untested)
   * Blackberry browser (untested)
   * Opera mobile 16+
   * Chrome for Android
   * Firefox for Android
   * IE Mobile (untested)
   * Safari 8 (with some limitations)
   * IOS Safari 8 (with some limitations)
 * Extended key range queries: equalsIgnoreCase(), anyOf([a,b,c,d,...]), startsWith(), startsWithIgnoreCase()
 * Logical "OR": friends.where("age").below(40).or("length").above(200).toArray(...);
 * Built to be easily extended and build addons upon.
 * Simplified upgrading framework
 * Thoroughly unit tested

Documentation
-------------
https://github.com/dfahlander/Dexie.js/wiki/Dexie.js

Samples
-------
https://github.com/dfahlander/Dexie.js/wiki/Samples

Forum
-----
https://groups.google.com/forum/#!forum/dexiejs

Download
--------
https://raw.githubusercontent.com/dfahlander/Dexie.js/master/dist/latest/Dexie.js
https://raw.githubusercontent.com/dfahlander/Dexie.js/master/dist/latest/Dexie.min.js

[npm-image]: https://img.shields.io/npm/v/dexie.svg?style=flat
[npm-url]: https://npmjs.org/package/dexie


