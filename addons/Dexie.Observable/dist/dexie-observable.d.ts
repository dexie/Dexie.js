// Type definitions for dexie-observable v4.0.1-beta.13
// Project: https://github.com/dexie/Dexie.js/tree/master/addons/Dexie.Observable
// Definitions by: David Fahlander <http://github.com/dfahlander>

import Dexie, { DexieEventSet } from 'dexie';
import { IDatabaseChange } from '../api';

export interface SyncNodeConstructor {
    new() : SyncNode;
}

//
// Interfaces of Dexie.Observable
//            


/**
 * A SyncNode represents a local database instance that subscribes
 * to changes made on the database.
 * SyncNodes are stored in the _syncNodes table.
 * 
 * Dexie.Syncable extends this interface and allows 'remote' nodes to be stored
 * as well.
 */
export interface SyncNode {
    id?: number,
    myRevision: number,
    type: 'local' | 'remote',
    lastHeartBeat: number,
    deleteTimeStamp: number, // In case lastHeartBeat is too old, a value of now + HIBERNATE_GRACE_PERIOD will be set here. If reached before node wakes up, node will be deleted.
    isMaster: number // 1 if true. Not using Boolean because it's not possible to index Booleans.
}

export interface ObservableEventSet extends DexieEventSet {
    (eventName: 'latestRevisionIncremented', subscriber: (dbName: string, latestRevision: number) => void): void;
    (eventName: 'suicideNurseCall', subscriber: (dbName: string, nodeID: number) => void): void;
    (eventName: 'intercomm', subscriber: (dbName: string) => void): void;
    (eventName: 'beforeunload', subscriber: () => void): void;
}

// Object received by on('message') after sendMessage() or broadcastMessage()
interface MessageEvent {
    id: number;
    type: string;
    message: any;
    destinationNode: number;
    wantReply?: boolean;
    resolve(result: any): void;
    reject(error: any): void;
}

//
// Extend Dexie interface
//
declare module 'dexie' {
    // Extend methods on db (db.sendMessage(), ...)
    interface Dexie {
        // Placeholder where to access the SyncNode class constructor.
        // (makes it valid to do new db.observable.SyncNode())
        observable: {
            version: string;
            SyncNode: SyncNodeConstructor;
            sendMessage(
                type: string, // Don't use 'response' as it is used internally by the framework
                message: any, // anything that can be saved by IndexedDB
                destinationNode: number,
                options: {
                    wantReply?: boolean;
                }
            ): Promise<any> | void; // When wantReply is undefined or false return is void

            broadcastMessage(
                type: string,
                message: any, // anything that can be saved by IndexedDB
                bIncludeSelf: boolean
            ): void;
        }

        readonly _localSyncNode: SyncNode;

        _changes: Dexie.Table<IDatabaseChange & {rev: number}, number>;
        _syncNodes: Dexie.Table<SyncNode, number>;
        _intercomm: Dexie.Table<any, number>;
    }

    // Extended events db.on('changes', subscriber), ...
    interface DbEvents {
        (eventName: 'changes', subscriber: (changes: IDatabaseChange[], partial: boolean)=>void): void;
        (eventName: 'cleanup', subscriber: ()=>any): void;
        (eventName: 'message', subscriber: (msg: MessageEvent)=>any): void;
    }

    // Extended IndexSpec with uuid boolean for primary key.
    interface IndexSpec {
        uuid: boolean;
    }

    interface DexieConstructor {
        Observable: {
            (db: Dexie) : void;

            version: string;
            createUUID: () => string;
            on: ObservableEventSet;
            localStorageImpl: {
                setItem(key: string, value: string): void,
                getItem(key: string): string,
                removeItem(key: string): void; 
            };
            _onStorage: (event: StorageEvent) => void;
        }

    }
}

export default Dexie.Observable;
