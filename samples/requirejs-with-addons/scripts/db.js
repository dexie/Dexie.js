
define(['dexie', 'dexie-observable', './console'], function (Dexie, DexieObservable, console) {

    // Declare Dexie instance and explicitely apply the addon:
    var db = new Dexie("appdb2", { addons: [DexieObservable] });
    
    // Define database schema
    db.version(1).stores({
        contacts: '++id,first,last'
    });


    // Populate ground data
    db.on('populate', function () {
        console.log("Populating data first time");
        // Populate a contact
        db.contacts.add({ first: 'Arnold', last: 'Fitzgerald' });
    });

    // Open database
    db.open();

    return db;
});
