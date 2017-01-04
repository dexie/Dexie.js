
import Dexie from 'dexie';
import '../../src/Dexie.Observable';
import { IDatabaseChange, DatabaseChangeType } from '../../api';

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
    msg.type;
    msg.message;
    msg.destinationNode * 1;
    msg.wantReply;
    msg.resolve('foo');
    msg.reject(new Error('Foo'));
});
db.observable.sendMessage('myMsgType', {foo: 'bar'}, 13, {wantReply: true}).then(() => {});
db.observable.sendMessage('myMsgType', 'foobar', 13, {wantReply: false});

db.observable.broadcastMessage('myBroadcastMsgType', {foo2: 'bar2'}, false);

db.on('changes', changes => {
    changes.forEach(change => {
        switch (change.type) {
            case DatabaseChangeType.Create:
                change.table.toLowerCase();
                change.key;
                change.obj;                
                break;
            case DatabaseChangeType.Update:
                change.table.toLowerCase();
                change.key;
                change.mods;
                break;
            case DatabaseChangeType.Delete:
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

Dexie.Observable.on('latestRevisionIncremented').unsubscribe(()=>{});
var x: IDatabaseChange = {key: 1, table: "", type: DatabaseChangeType.Delete};
x.key;
x.type;
