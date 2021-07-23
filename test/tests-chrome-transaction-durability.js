import Dexie from 'dexie';
import {start, asyncTest, ok} from 'QUnit';
import {resetDatabase} from './dexie-unittest-utils';

"use strict";

module("chrome-transaction-durability", {
    setup: function () {
    },
    teardown: function () {
    }
});

asyncTest("Transaction should use relaxed durability if specified", function() {
    const db = setupDb('relaxed')
    db.transaction('rw', db.users, trans => {
        ok(trans.idbtrans.durability === 'relaxed', "Transaction has relaxed durability");
    }).catch(function (err) {
        ok(false, err);
    }).finally(function () {
        resetDatabase(db).catch(function (e) {
            ok(false, "Error resetting database: " + e.stack);
        }).finally(start);
    });
});


asyncTest("Transaction should use strict durability if specified", function() {
    const db = setupDb('strict')
    db.transaction('rw', db.users, trans => {
        ok(trans.idbtrans.durability === 'strict', "Transaction has strict durability");
    }).catch(function (err) {
        ok(false, err);
    }).finally(function () {
        resetDatabase(db).catch(function (e) {
            ok(false, "Error resetting database: " + e.stack);
        }).finally(start);
    });
});


asyncTest("Transaction should use default durability if not specified", function() {
    const db = setupDb()
    db.transaction('rw', db.users, trans => {
        ok(trans.idbtrans.durability === 'default', "Transaction has default durability");
    }).catch(function (err) {
        ok(false, err);
    }).finally(function () {
        resetDatabase(db).catch(function (e) {
            ok(false, "Error resetting database: " + e.stack);
        }).finally(start);
    });
});

const setupDb = (chromeTransactionDurability) => {
    const db = new Dexie("TestDBTrans", { chromeTransactionDurability });
    db.version(1).stores({
        users: "username",
    });
    return db;
}