///<reference path="require.js" />
require.config({
    paths: {
        "Dexie": "../../../src/Dexie",
        "Dexie.Observable": "../../../addons/Dexie.Observable/Dexie.Observable"
    }
});

requirejs(['Dexie', './console', './db', './ChangeLogger'], function (Dexie, console, db, ChangeLogger) {

    console.log("Hello world!");

    ChangeLogger(db);

    console.log("Now adding a contact to database");
    db.contacts.add({ first: "Another", last: "Person" }).then(function () {

        console.log("Now deleting that contact from database");
        return db.contacts.where('first').equals("Another").and(function(p) { return p.last == "Person"; }).delete();
    });
});
