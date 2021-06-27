
import Dexie from 'dexie';
import Console from './console';
import {db,Contact} from './appdb';

const console = new Console(); // So that you dont have to press F12...

document.addEventListener('DOMContentLoaded', async function () {
    
    //
    // Bootstrapping
    //
    
    // Initialize our Console widget - it will log browser window.
    document
        .getElementById('consoleArea')
        .appendChild(console.textarea);

    // Test it:
    console.log("Hello world!");

    try {
        //
        // Let's clear and re-seed the database:
        //
        console.log("Clearing database...");
        //await db.delete();
        //await db.open();
        await Promise.all([db.contacts.clear(), db.emails.clear(), db.phones.clear()]);
        
        await haveSomeFun();
    } catch (ex) {
        console.error(ex);
    }
});

async function haveSomeFun() {
    //
    // Seed Database
    //
    console.log("Seeding database with some contacts...");
    await db.transaction('rw', db.contacts, db.emails, db.phones, async function () {
        // Populate a contact
        let arnoldId = await db.contacts.add(new Contact('Arnold', 'Fitzgerald'));

        // Populate some emails and phone numbers for the contact
        db.emails.add({ contactId: arnoldId, type: 'home', email: 'arnold@email.com' });
        db.emails.add({ contactId: arnoldId, type: 'work', email: 'arnold@abc.com' });
        db.phones.add({ contactId: arnoldId, type: 'home', phone: '12345678' });
        db.phones.add({ contactId: arnoldId, type: 'work', phone: '987654321' });

        // ... and another one...
        let adamId = await db.contacts.add(new Contact('Adam', 'Tensta'));
        // Populate some emails and phone numbers for the contact
        db.emails.add({ contactId: adamId, type: 'home', email: 'adam@tensta.se' });
        db.phones.add({ contactId: adamId, type: 'work', phone: '88888888' });
    });

    //
    // For fun - add a phone number to Adam
    //
    
    // Now, just to examplify how to use the save() method as an alternative
    // to db.phones.add(), we will add yet another phone number
    // to an existing contact and then re-save it:
    console.log("Playing a little: adding another phone entry for Adam Tensta...");
    let adam = await db.contacts.orderBy('lastName').last();
    console.log(`Found contact: ${adam.firstName} ${adam.lastName} (id: ${adam.id})`);
    
    // To add another phone number to adam, the straight forward way would be this:
    await db.phones.add({contactId: adam.id, type: "custom", phone: "+46 7777777"});

    // But now let's do that same thing by manipulating navigation property instead:
    // Load emails and phones navigation properties
    await adam.loadNavigationProperties();
    
    // Now, just push another phone number to adam.phones navigation property:
    adam.phones.push({
        contactId: adam.id,
        type: 'custom',
        phone: '112'
    });
    // And just save adam:
    console.log("Saving contact");
    await adam.save();
    
    // Now, print out all contacts
    console.log("Now dumping some contacts to console:");
    await printContacts();
}

async function printContacts() {

    // Now we're gonna list all contacts starting with letter 'A','B' or 'C'
    // and print them out.
    // For each contact, also resolve the navigation properties.

    // For atomicity and speed, use a single transaction for the
    // queries to make:    
    let contacts = await db.transaction('r', [db.contacts, db.phones, db.emails], async()=>{

        // Query some contacts
        let contacts = await db.contacts
            .where('firstName').startsWithAnyOfIgnoreCase('a','b','c')
            .sortBy('id');      

        // Resolve array properties 'emails' and 'phones'
        // on each and every contact:
        await Promise.all (contacts.map(contact => contact.loadNavigationProperties()));

        return contacts;
    });

    // Print result
    console.log("Database contains the following contacts:");
    contacts.forEach(contact => {
        console.log(contact.id + ". " + contact.firstName + " " + contact.lastName);
        console.log("   Phone numbers: ");
        contact.phones.forEach(phone => {
            console.log("     " + phone.phone + "(" + phone.type + ")");
        });
        console.log("   Emails: ");
        contact.emails.forEach(email => {
            console.log("     " + email.email + "(" + email.type + ")");
        });
    });
}

