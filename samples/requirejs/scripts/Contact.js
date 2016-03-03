
define(['./db'], function (db) {
    
    function Contact(id, first, last) {
        this.id = id;
        this.first = first;
        this.last = last;
    }
    
    Contact.prototype.resolve = function () {
        var contact = this;

        return db.emails.where('contactId').equals(contact.id).toArray(function (emails) {

            return db.phones.where('contactId').equals(contact.id).toArray(function (phones) {

                return {
                    id: contact.id,
                    first: contact.first,
                    last: contact.last,
                    emails: emails,
                    phones: phones
                };
            });
        });
    };

    db.contacts.mapToClass(Contact);

    return Contact;
});
