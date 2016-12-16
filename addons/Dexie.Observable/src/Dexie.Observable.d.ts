// Type definitions for dexie-observable v{version}
// Project: https://github.com/dfahlander/Dexie.js/tree/master/addons/Dexie.Observable
// Definitions by: David Fahlander <http://github.com/dfahlander>

import Dexie from 'dexie';

//
// Extend Dexie interface
//
declare module 'dexie' {
    module Dexie {
        // Extended events db.on('changes', subscriber), ...
        interface DbEvents {
            (eventName: 'changes', subscriber: (changes: IDatabaseChange[], partial: boolean)=>void): void;
            (eventName: 'cleanup', subscriber: ()=>any): void;
            (eventName: 'message', subscriber: (msg: Object)=>any): void;
        }

        // Extended IndexSpec with uuid boolean for primary key.
        interface IndexSpec {
            uuid: boolean;
        }

        // Define Dexie.Observable
        var Observable: Observable;
    }

    // Extend methods on db (db.sendMessage(), ...)
    interface Dexie {
        sendMessage(
            type: string,
            message: Object,
            destinationNode: number,
            options: {
                wantReply?: boolean,
                isFailure?: boolean,
                requestId?: number
            })
        : Promise<any>;

        broadcastMessage(
            type: string,
            message: Object,
            bIncludeSelf: boolean
        ): void;

        // Placeholder where to access the SyncNode class constructor.
        // (makes it valid to do new db.observable.SyncNode())
        observable: {SyncNode: SyncNodeConstructor}
    }

}

//
// Interfaces of Dexie.Observable
//

export interface SyncNodeConstructor {
    new() : SyncNode;
}

export interface SyncNode {
    id: number,
    myRevision: number,
    type: 'local' | 'remote',
    lastHeartBeat: number,
    deleteTimeStamp: number, // In case lastHeartBeat is too old, a value of now + HIBERNATE_GRACE_PERIOD will be set here. If reached before node wakes up, node will be deleted.
    url: string, // Only applicable for "remote" nodes. Only used in Dexie.Syncable.
    isMaster: number, // 1 if true. Not using Boolean because it's not possible to index Booleans.

    // Below properties should be extended in Dexie.Syncable. Not here. They apply to remote nodes only (type == "remote"):
    // TODO: Remove them from here and put them in Dexie.Syncable.d.ts!

    syncProtocol: string, // Tells which implementation of ISyncProtocol to use for remote syncing. 
    syncContext: any,
    syncOptions: Object,
    status: number,
    appliedRemoteRevision: any,
    remoteBaseRevisions: { local: number, remote: any }[],
    dbUploadState: {
        tablesToUpload: string[],
        currentTable: string,
        currentKey: any,
        localBaseRevision: number
    }
}

export enum DatabaseChangeType {
    Create = 1,
    Update = 2,
    Delete = 3
}

export interface ICreateChange {
    type: DatabaseChangeType.Create,
    table: string;
    key: any;
    obj: Object;
}

export interface IUpdateChange {
    type: DatabaseChangeType.Update;
    table: string;
    key: any;
    mods: {[keyPath: string]:any | undefined};
}

export interface IDeleteChange {
    type: DatabaseChangeType.Delete;
    table: string;
    key: any;
}

export type IDatabaseChange = ICreateChange | IUpdateChange | IDeleteChange; 

export interface ObservableEventSet extends Dexie.DexieEventSet {
    (eventName: 'latestRevisionIncremented', subscriber: (dbName: string, latestRevision: number) => void): void;
    (eventName: 'suicideNurseCall', subscriber: (dbName: string, nodeID: number) => void): void;
    (eventName: 'intercomm', subscriber: (dbName: string) => void): void;
    (eventName: 'beforeunload', subscriber: () => void): void;
}

export interface Observable {
    createUUID(): string;
    on: ObservableEventSet,
    localStorageImpl: {
        setItem(key: string, value: string): void,
        getItem(key: string): string,
        removeItem(key: string): void; 
    }
    _onStorage (event: StorageEvent);
}

export default Dexie.Observable;
