///<reference path="../../src/Dexie.d.ts" />
///<reference path="appdb.ts" />

import Console = Utils.Console;
import db = AppDb.db;

document.addEventListener('DOMContentLoaded', () => {

    var console = new Console();
    document.getElementById('consoleArea').appendChild(console.textarea);

    console.log("Hello world!");

    db.transaction('r', [db.contacts, db.phones, db.emails], () => {

        // Query all contacts
        db.contacts.toArray(contacts =>

            // Resolve all foreign keys
            // Use Contact.resolve() helper method from class Contact in appdb.ts
            Dexie.Promise.all(contacts.map(contact => contact.resolve()))

        ).then(resolvedContacts => {

            // Print result
            console.log("Database contains the following contacts:");
            resolvedContacts.forEach(contact => {
                console.log("Name: " + contact.first + " " + contact.last);
                console.log("Phone numbers: ");
                contact.phones.forEach(phone => {
                    console.log("  " + phone.phone + "(" + phone.type + ")");
                });
                console.log("Emails: ");
                contact.emails.forEach(email => {
                    console.log("  " + email.email + "(" + email.type + ")");
                });
                console.log("\n");
            });
        });

    }).then(() => {

        console.log("Transaction done");

    });
});
