
require.config({
    paths: {
        "dexie": "https://unpkg.com/dexie/dist/dexie"
    }
});

requirejs(['dexie', './console', './db', './Contact'], function (Dexie, console, db, Contact) {

    db.transaction('r', db.contacts, db.phones, db.emails, function () {
        
        // Query all contacts
        db.contacts.toArray(function (contacts) {
            
            // Resolve all foreign keys
            return Dexie.Promise.all(contacts.map(function (contact) {

                // Use Contact.resolve() helper method from Contact.js
                return contact.resolve();
            }));

        }).then(function (resolvedContacts) {

            // Print result
            console.log("Database contains the following contacts:");
            console.log(JSON.stringify(resolvedContacts, null, 4));
        });

    }).then(function () {

        console.log("Transaction done");

    });
});
