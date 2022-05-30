/**
 * Just importing the Dexie.js library
 * should not prevent a Node.js process from exiting.
 */
const { Dexie } = require('../');
console.dir(Dexie);
