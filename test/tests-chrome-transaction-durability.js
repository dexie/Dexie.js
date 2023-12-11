import Dexie from 'dexie';
import {start, asyncTest, ok} from 'QUnit';
import {isChrome, resetDatabase} from './dexie-unittest-utils';

"use strict";

module("chrome-transaction-durability", {
    setup: function () {
    },
    teardown: function () {
    }
});

asyncTest("Transaction should use relaxed durability if specified", function() {
    if (!isChrome) {
        ok(true, "This browser does not support Chrome transaction durability");
        start();
        return;
    }

    const db = setupDb('relaxed')
    db.transaction('rw', db.users, trans => {
        if (trans.idbtrans.durability === void 0) {
            ok(true, "This version of Chromium does not support transaction durability");
        } else {
            ok(trans.idbtrans.durability === 'relaxed', "Transaction has relaxed durability");
        }
    }).catch(function (err) {
        ok(false, err);
    }).finally(function () {
        resetDatabase(db).catch(function (e) {
            ok(false, "Error resetting database: " + e.stack);
        }).finally(start);
    });
});


asyncTest("Transaction should use strict durability if specified", function() {
    if (!isChrome) {
        ok(true, "This browser does not support Chrome transaction durability");
        start();
        return;
    }

    const db = setupDb('strict')
    db.transaction('rw', db.users, trans => {
        if (trans.idbtrans.durability === void 0) {
            ok(true, "This version of Chromium does not support transaction durability");
        } else {
            ok(trans.idbtrans.durability === 'strict', "Transaction has strict durability");
        }
    }).catch(function (err) {
        ok(false, err);
    }).finally(function () {
        resetDatabase(db).catch(function (e) {
            ok(false, "Error resetting database: " + e.stack);
        }).finally(start);
    });
});


asyncTest("Transaction should use default durability if not specified", function() {
    if (!isChrome) {
        ok(true, "This browser does not support Chrome transaction durability");
        start();
        return;
    }

    const db = setupDb()
    db.transaction('rw', db.users, trans => {
        if (trans.idbtrans.durability === void 0) {
            ok(true, "This version of Chromium does not support transaction durability");
        } else {
            ok(trans.idbtrans.durability === 'default', "Transaction has default durability");
        }
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