// Type definitions for dexie-observable v0.9.2
// Project: https://github.com/dfahlander/Dexie.js/tree/master/addons/Dexie.Observable
// Definitions by: David Fahlander <http://github.com/dfahlander>

import Dexie from 'dexie';
import { IDatabaseChange } from '../api';

//
// Extend Dexie interface
//
declare module 'dexie' {
    // Extend methods on db (db.sendMessage(), ...)
    interface Dexie {
        sendMessage(
            type: string,
            message: any,
            destinationNode: number,
            options: {
                wantReply?: boolean,
                isFailure?: boolean,
                requestId?: number
            })
        : Promise<any>;

        broadcastMessage(
            type: string,
            message: any,
            bIncludeSelf: boolean
        ): void;

        // Placeholder where to access the SyncNode class constructor.
        // (makes it valid to do new db.observable.SyncNode())
        observable: {SyncNode: Dexie.Observable.SyncNodeConstructor}

        readonly _localSyncNode: Dexie.Observable.SyncNode;

        _changes: Dexie.Table<IDatabaseChange & {rev: number}, number>;
        _syncNodes: Dexie.Table<Dexie.Observable.SyncNode, number>;
        _intercomm: Dexie.Table<any, number>;
    }

    module Dexie {
        // Extended events db.on('changes', subscriber), ...
        interface DbEvents {
            (eventName: 'changes', subscriber: (changes: IDatabaseChange[], partial: boolean)=>void): void;
            (eventName: 'cleanup', subscriber: ()=>any): void;
            (eventName: 'message', subscriber: (msg: any)=>any): void;
        }

        // Extended IndexSpec with uuid boolean for primary key.
        interface IndexSpec {
            uuid: boolean;
        }

        //
        // Define Dexie.Observable
        //
        module Observable {
            //
            //
            //
            var createUUID: () => string;
            var on: Observable.ObservableEventSet;
            var localStorageImpl: {
                setItem(key: string, value: string): void,
                getItem(key: string): string,
                removeItem(key: string): void; 
            };
            var _onStorage: (event: StorageEvent) => void;
            
            //
            // Interfaces of Dexie.Observable
            //            

            interface SyncNodeConstructor {
                new() : SyncNode;
            }

            /**
             * A SyncNode represents a local database instance that subscribes
             * to changes made on the database.
             * SyncNodes are stored in the _syncNodes table.
             * 
             * Dexie.Syncable extends this interface and allows 'remote' nodes to be stored
             * as well.
             */
            interface SyncNode {
                id?: number,
                myRevision: number,
                type: 'local' | 'remote',
                lastHeartBeat: number,
                deleteTimeStamp: number, // In case lastHeartBeat is too old, a value of now + HIBERNATE_GRACE_PERIOD will be set here. If reached before node wakes up, node will be deleted.
                isMaster: number // 1 if true. Not using Boolean because it's not possible to index Booleans.
            }

            interface ObservableEventSet extends Dexie.DexieEventSet {
                (eventName: 'latestRevisionIncremented', subscriber: (dbName: string, latestRevision: number) => void): void;
                (eventName: 'suicideNurseCall', subscriber: (dbName: string, nodeID: number) => void): void;
                (eventName: 'intercomm', subscriber: (dbName: string) => void): void;
                (eventName: 'beforeunload', subscriber: () => void): void;
            }
        }
    }
}

export default Dexie.Observable;
