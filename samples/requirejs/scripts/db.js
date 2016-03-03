
define(['dexie'], function (Dexie) {
    
    // Declare Dexie instance
    var db = new Dexie("appdb");

    // Define database schema
    db.version(1).stores({
        contacts: '++id,first,last',
        emails: '++id,contactId,type,email',
        phones: '++id,contactId,type,phone',
    });

    // Populate ground data
    db.on('populate', function () {
        
        // Populate a contact
        db.contacts.add({ first: 'Arnold', last: 'Fitzgerald' }).then(function (id) {

            // Populate some emails and phone numbers for the contact
            db.emails.add({ contactId: id, type: 'home', email: 'arnold@email.com' });
            db.emails.add({ contactId: id, type: 'work', email: 'arnold@abc.com' });
            db.phones.add({ contactId: id, type: 'home', phone: '12345678' });
            db.phones.add({ contactId: id, type: 'work', phone: '987654321' });
        });
    });

    // Open database
    db.open();
    
    return db;
});
