
require.config({
    paths: {
        "dexie": "../../../dist/dexie.min",
        "dexie-observable": "../../../addons/Dexie.Observable/dist/dexie-observable.min"
    }
});

requirejs(['dexie', './console', './db', './ChangeLogger'], function (Dexie, console, db, ChangeLogger) {
    
    console.log("Hello world!");

    ChangeLogger(db);

    console.log("Now adding a contact to database");
    db.contacts.add({ first: "Another", last: "Person" }).then(function () {

        console.log("Now deleting that contact from database");
        return db.contacts.where('first').equals("Another").and(function(p) { return p.last == "Person"; }).delete();
    });
});
