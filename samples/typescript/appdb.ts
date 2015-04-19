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
            // This will make it possible to call loadEmailsAndPhones()
            // directly on retrieved database objects.
            db.contacts.mapToClass(Contact);
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

    /* This is a 'physical' class that is mapped to
     * the contacts table. We can have methods on it that
     * we could call on retrieved database objects.
     */
    export class Contact {
        id: number;
        first: string;
        last: string;
        emails: IEmailAddress[];
        phones: IPhoneNumber[];

        constructor(first: string, last: string, id?:number) {
            this.first = first;
            this.last = last;
            if (id) this.id = id;
        }

        loadEmailsAndPhones() {
            return Dexie.Promise.all(
                db.emails
                  .where('contactId').equals(this.id)
                  .toArray(emails => this.emails = emails)
                ,
                db.phones
                  .where('contactId').equals(this.id)
                  .toArray(phones => this.phones = phones)

            ).then(x => this);
        }

        save() {
            return db.transaction('rw', db.contacts, db.emails, db.phones, () => {
                Dexie.Promise.all(
                    // Save existing arrays
                    Dexie.Promise.all(this.emails.map(email => db.emails.put(email))),
                    Dexie.Promise.all(this.phones.map(phone => db.phones.put(phone))))
                .then(results => {
                    // Remove items from DB that is was not saved here:
                    var emailIds = results[0], // array of resulting primary keys
                        phoneIds = results[1]; // array of resulting primary keys

                    db.emails.where('contactId').equals(this.id)
                        .and(email => emailIds.indexOf(email.id) === -1)
                        .delete();

                    db.phones.where('contactId').equals(this.id)
                        .and(phone => phoneIds.indexOf(phone.id) === -1)
                        .delete();

                    // At last, save our own properties.
                    // (Must not do put(this) because we would get
                    // reduntant emails/phones arrays saved into db)
                    db.contacts.put(
                        new Contact(this.first, this.last, this.id))
                        .then(id => this.id = id);
                });
            });
        }
    }

    export var db = new AppDatabase();
    db.open();
}