
import Dexie from 'dexie';
import '../../src/Dexie.Observable';
import Observable from '../../src/Dexie.Observable'; // Optional - will get Dexie.Observable into Observable.

interface Foo {
    id: string;
}

class MyDb extends Dexie {
    foos: Dexie.Table<Foo, string>;

    constructor() {
        super('testdb');
        this.version(1).stores({foos: '$$id'});
    }
}

let db = new MyDb();

let syncNode = new db.observable.SyncNode();
syncNode.isMaster;
syncNode.deleteTimeStamp.toExponential();
syncNode.lastHeartBeat.toExponential();
syncNode.myRevision.toFixed();

db.on('message', msg => {
});
db.sendMessage('myMsgType', {foo: 'bar'}, 13, {wantReply: true});

db.broadcastMessage('myBroadcastMsgType', {foo2: 'bar2'}, false);

db.on('changes', changes => {
    changes.forEach(change => {
        switch (change.type) {
            case Observable.DatabaseChangeType.Create:
                change.table.toLowerCase();
                change.key;
                change.obj;                
                break;
            case Observable.DatabaseChangeType.Update:
                change.table.toLowerCase();
                change.key;
                change.mods;
                break;
            case Observable.DatabaseChangeType.Delete:
                change.table.toLowerCase();
                change.key;
                break;
        }
    })
});

Dexie.Observable.createUUID().toLowerCase();
Dexie.Observable.on('latestRevisionIncremented', (dbName, rev) => {dbName.toLowerCase(); rev.toFixed()});
Dexie.Observable.on('latestRevisionIncremented').subscribe(()=>{});
Dexie.Observable.on('latestRevisionIncremented').fire(()=>{});
Dexie.Observable.on('latestRevisionIncremented').unsubscribe(()=>{});

Dexie.Observable.on('suicideNurseCall', (dbName, nodeId)=>{dbName.toLowerCase(); nodeId.toExponential()});
Dexie.Observable.on('intercomm', dbName=>{dbName.toLowerCase()});
Dexie.Observable.on('beforeunload', ()=>{});

Observable.on('latestRevisionIncremented').unsubscribe(()=>{});
var x: Observable.IDatabaseChange = {key: 1, table: "", type: Observable.DatabaseChangeType.Delete};
x.key;
x.type;
