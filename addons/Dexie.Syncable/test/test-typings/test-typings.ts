
import Dexie from 'dexie';
import 'dexie-observable';
import '../../src/Dexie.Syncable';
import {IDatabaseChange, DatabaseChangeType} from '../../api';

//
// Typings for registerSyncProtocol():
//
Dexie.Syncable.registerSyncProtocol("myProtocol", {
    sync: (context,
        url,
        options,
        baseRevision,
        syncedRevision,
        changes,
        partial,
        applyRemoteChanges,
        onChangesAccepted,
        onSuccess,
        onError) => {
            context["customProp"] = 3;
            context.save().catch(ex=>{});
            url.toLowerCase();
            changes.forEach(change => {
                if (change.type === DatabaseChangeType.Create) {
                    change.obj.hello; // Should be able to access custom props on change.obj.
                    change.key;
                    change.table.toLowerCase();
                    change.type.toExponential();
                } else if (change.type === DatabaseChangeType.Update) {
                    Object.keys(change.mods).forEach(keyPath => {
                        change.mods[keyPath];
                    });
                } else if (change.type === DatabaseChangeType.Delete) {
                    change.key;
                    change.table;
                }
            });
            partial.valueOf(); // boolean
            applyRemoteChanges(changes, {anyType:'anyValue'}, true);
            applyRemoteChanges(changes, {anyType:'anyValue'});
            onChangesAccepted();
            onError(new Error("hoohoo"), 5000);
            // Poll pattern typings:
            onSuccess({ again: 5000 }); 
            // React pattern typings:
            onSuccess({
                react (changes, baseRevision, partial, onChangesAccepted) {
                    changes.forEach(change => change.key && change.table.toUpperCase() && change.type.toExponential());
                    baseRevision;
                    partial.valueOf();
                    onChangesAccepted();
                },
                disconnect(){}
            });
        }
});

//
// 2. Declare Your Database.
//
class Foo {
    id: Date;
    bar() {};
    age: number;
    address: {
        city: string;
    }
}

class MyDb extends Dexie {
    foo: Dexie.Table<Foo, Date>;
    constructor() {
        super('mydb');
        this.version(1).stores({foo: 'id'});
        //
        // Connect
        //
        this.syncable.connect(
            "myProtocol",
            "https://remote-server/...",
            {anyOption: 'anyValue'})
        .catch(err => {
            console.error (`Failed to connect: ${err.stack || err}`);
        });
    }
}

var db = new MyDb();
// Start using the database as normal.
db.foo.where('x').notEqual(1).toArray(foos => {
    foos.forEach(foo => foo.bar());
}).catch(err => {
});
db.foo.get(new Date()).then(foo => foo && foo.bar());

db.syncable.disconnect("myUrl");
db.syncable.delete("myUrl");
db.syncable.getStatus("myUrl").finally(()=>{}).catch('DatabaseClosedError', ex => ex.name);
db.syncable.list().then(urls => Promise.all(
    urls.map(url => db.syncable.getStatus(url).then (status => ({url: url, status: status})))
)).then(urlsAndStatuses => {
    urlsAndStatuses.forEach(urlAndStatus => {
        urlAndStatus.url.toLowerCase();
        urlAndStatus.status.toExponential();
    });
});
// With async/await
async function getUrlsAndStatuses() {
    let urls = await db.syncable.list();
    let statuses = await Dexie.Promise.all(urls.map(url => db.syncable.getStatus(url)));
}

function statusChanged(status: number, url: string) {
    status.toExponential();
    url.toLowerCase();
}
db.syncable.on('statusChanged', statusChanged);
db.syncable.on('statusChanged').unsubscribe(statusChanged);

