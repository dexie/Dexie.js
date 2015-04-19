///<reference path="../../src/Dexie.d.ts" />
///<reference path="appdb.ts" />

import Console = Utils.Console;
import db = AppDb.db;

document.addEventListener('DOMContentLoaded', () => {

    // Initialize our Console widget - it will log browser window.
    var console = new Console();
    document.getElementById('consoleArea').appendChild(console.textarea);

    // Test it:
    console.log("Hello world!");

    // Make sure to never miss any unexpected error:
    Dexie.Promise.on.error.subscribe(e => {
        // Log any uncatched error:
        console.error(e);
    });

    //
    // Let's clear and re-seed the database:
    //
    clearDatabase()
        .then(seedDatabase)
        .then(playALittle_add_phone_to_adam)
        .then(printContacts);

    function clearDatabase() {
        console.log("Clearing database...");
        return Dexie.Promise.all(
            db.contacts.clear(),
            db.emails.clear(),
            db.phones.clear());
    }

    function seedDatabase() {
        console.log("Seeding database with some contacts...");
        return db.transaction('rw', db.contacts, db.emails, db.phones, () => {
            // Populate a contact
            db.contacts.add(new AppDb.Contact('Arnold', 'Fitzgerald')).then(id => {
                // Populate some emails and phone numbers for the contact
                db.emails.add({ contactId: id, type: 'home', email: 'arnold@email.com' });
                db.emails.add({ contactId: id, type: 'work', email: 'arnold@abc.com' });
                db.phones.add({ contactId: id, type: 'home', phone: '12345678' });
                db.phones.add({ contactId: id, type: 'work', phone: '987654321' });
            });

            // ... and another one...
            db.contacts.add(new AppDb.Contact('Adam', 'Tensta')).then(id => {
                // Populate some emails and phone numbers for the contact
                db.emails.add({ contactId: id, type: 'home', email: 'adam@tensta.se' });
                db.phones.add({ contactId: id, type: 'work', phone: '88888888' });
            });
        });
    }

    function playALittle_add_phone_to_adam () {
        // Now, just to examplify how to use the save() method as an alternative
        // to db.phones.add(), we will add yet another phone number
        // to an existing contact and then re-save it:
        console.log("Playing a little: adding another phone entry for Adam Tensta...");
        return db.contacts
            .where('last').equals('Tensta').first(c => c.loadEmailsAndPhones())
            .then(contact => {
                // Also add another phone number to Adam Tensta:
                contact.phones.push({
                    contactId: contact.id,
                    type: 'custom',
                    phone: '112'
                });
                contact.save();
            });
    }

    function printContacts() {

        // Now we're gonna list all contacts starting with letter 'A'
        // and print them out.
        // For each contact, also resolve its collection of
        // phone number entries and email addresses by reverse-quering
        // the foreign tables.

        // For atomicity and speed, use a single transaction for the
        // queries to make:
        db.transaction('r', [db.contacts, db.phones, db.emails], () => {

            // Query some contacts
            return db.contacts
                .where('first').startsWithIgnoreCase('a')
                .sortBy('id')
                .then(contacts =>

                    // Resolve array properties 'emails' and 'phones'
                    // on each and every contact:
                    Dexie.Promise.all(
                        contacts.map(contact =>
                            contact.loadEmailsAndPhones()))
                );

        }).then(contacts => {

            // Print result
            console.log("Database contains the following contacts:");
            contacts.forEach(contact => {
                console.log(contact.id + ". " + contact.first + " " + contact.last);
                console.log("   Phone numbers: ");
                contact.phones.forEach(phone => {
                    console.log("     " + phone.phone + "(" + phone.type + ")");
                });
                console.log("   Emails: ");
                contact.emails.forEach(email => {
                    console.log("     " + email.email + "(" + email.type + ")");
                });
            });
        });
    }
});

