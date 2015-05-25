var Dexie = require("dexie"),
    console = require("./console"),
    db = require("./db"),
    Contact = require("./contact");

db.transaction('r', db.contacts, db.phones, db.emails, function () {

    // Query all contacts
    db.contacts.toArray(function (contacts) {

        // Resolve all foreign keys
        return Dexie.Promise.all(contacts.map(function (contact) {

            // Use Contact.prototype.resolve() helper method from contact.js
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
