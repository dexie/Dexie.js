///<reference path="../../src/Dexie.d.ts" />

module AppDb {

    export class AppDatabase extends Dexie {

        contacts: Dexie.Table<Contact, number>;
        emails: Dexie.Table<IEmailAddress, number>;
        phones: Dexie.Table<IPhoneNumber, number>;

        constructor() {

            super("MyTypeScriptAppDb");

            var db = this;

            //
            // Define tables and indexes
            //
            db.version(1).stores({
                contacts: '++id, first, last',
                emails: '++id, contactId, type, email',
                phones: '++id, contactId, type, phone',
            });

            // Let's physically map Contact class to contacts table.
            // This will make it possible to call the resolve() method
            // directly on retrieved database objects.
            db.contacts.mapToClass(Contact);

            // Populate ground data
            db.on('populate', () => {

                // Populate a contact
                db.contacts.add(new Contact('Arnold', 'Fitzgerald')).then(id => {
                    // Populate some emails and phone numbers for the contact
                    db.emails.add({ contactId: id, type: 'home', email: 'arnold@email.com' });
                    db.emails.add({ contactId: id, type: 'work', email: 'arnold@abc.com' });
                    db.phones.add({ contactId: id, type: 'home', phone: '12345678' });
                    db.phones.add({ contactId: id, type: 'work', phone: '987654321' });
                });
            });
        }
    }

    /* This is a 'physical' class that is mapped to
     * the contacts table. We can have methods on it that
     * we could call on retrieved database objects.
     */
    export class Contact {
        id: number;
        constructor(public first: string, public last: string) { }

        resolve() {
            return db.emails
                .where('contactId').equals(this.id)
                .toArray(emails =>
                    db.phones
                        .where('contactId').equals(this.id)
                        .toArray(phones => (
                            {
                                id: this.id,
                                first: this.first,
                                last: this.last,
                                emails: emails,
                                phones: phones
                            })));
        }
    }

    /* Just for code completion and compilation - defines
     * the interface of objects stored in the emails table.
     */
    export interface IEmailAddress {
        id?: number;
        contactId: number;
        type: string;
        email: string;
    }

    /* Just for code completion and compilation - defines
     * the interface of objects stored in the phones table.
     */
    export interface IPhoneNumber {
        id?: number;
        contactId: number;
        type: string;
        phone: string;
    }

    export var db = new AppDatabase();
    db.open();
}