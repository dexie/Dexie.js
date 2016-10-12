import Dexie from 'dexie';

export class AppDatabase extends Dexie {

    contacts: Dexie.Table<Contact, number>;
    emails: Dexie.Table<IEmailAddress, number>;
    phones: Dexie.Table<IPhoneNumber, number>;

    constructor() {

        super("ContactsDatabase");

        var db = this;

        //
        // Define tables and indexes
        //
        db.version(1).stores({
            contacts: '++id, firstName, lastName',
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
    firstName: string;
    lastName: string;
    emails: IEmailAddress[];
    phones: IPhoneNumber[];
    
    constructor(first: string, last: string, id?:number) {
        this.firstName = first;
        this.lastName = last;
        if (id) this.id = id;
        // Define navigation properties.
        // Making them non-enumerable will prevent them from being handled by indexedDB
        // when doing put() or add().
        Object.defineProperties(this, {
            emails: {value: [], enumerable: false, writable: true },
            phones: {value: [], enumerable: false, writable: true }
        });
    }
    
    async loadNavigationProperties() {
        [this.emails, this.phones] = await Promise.all([
            db.emails.where('contactId').equals(this.id).toArray(),
            db.phones.where('contactId').equals(this.id).toArray()
        ]);
    }

    save() {
        return db.transaction('rw', db.contacts, db.emails, db.phones, async() => {
            
            // Add or update our selves. If add, record this.id.
            this.id = await db.contacts.put(this);

            // Save all navigation properties (arrays of emails and phones)
            // Some may be new and some may be updates of existing objects.
            // put() will handle both cases.
            // (record the result keys from the put() operations into emailIds and phoneIds
            //  so that we can find local deletes)
            let [emailIds, phoneIds] = await Promise.all ([
                Promise.all(this.emails.map(email => db.emails.put(email))),
                Promise.all(this.phones.map(phone => db.phones.put(phone)))
            ]);
                            
            // Was any email or phone number deleted from out navigation properties?
            // Delete any item in DB that reference us, but is not present
            // in our navigation properties:
            await Promise.all([
                db.emails.where('contactId').equals(this.id) // references us
                    .and(email => emailIds.indexOf(email.id) === -1) // Not anymore in our array
                    .delete(),
            
                db.phones.where('contactId').equals(this.id)
                    .and(phone => phoneIds.indexOf(phone.id) === -1)
                    .delete()
            ]);
        });
    }
}

export var db = new AppDatabase();

