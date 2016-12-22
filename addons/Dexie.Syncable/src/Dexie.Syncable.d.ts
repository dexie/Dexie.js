// Type definitions for dexie-syncable v{version}
// Project: https://github.com/dfahlander/Dexie.js/tree/master/addons/Dexie.Syncable
// Definitions by: David Fahlander <http://github.com/dfahlander>

import Dexie from 'dexie';
import 'dexie-observable';
import { IDatabaseChange, ISyncProtocol, SyncStatus } from '../api';

//
// Extend Dexie interface
//
declare module 'dexie' {
    interface Dexie {
        syncable: {
            /**
             * Connect to given URL using given protocol and options. See documentation at:
             * https://github.com/dfahlander/Dexie.js/wiki/db.syncable.connect()
             */
            connect(protocol: string, url: string, options?: any): Dexie.Promise<void>;
            
            /**
             * Stop syncing with given url.. See docs at:
             * https://github.com/dfahlander/Dexie.js/wiki/db.syncable.disconnect()
             */
            disconnect(url: string): void;

            /**
             * Stop syncing and delete all sync state for given URL. See docs at:
             * https://github.com/dfahlander/Dexie.js/wiki/db.syncable.delete()
             */
            delete(url: string): void;

            /**
             * List remote URLs. See docs at:
             * https://github.com/dfahlander/Dexie.js/wiki/db.syncable.list()
             */
            list (): Dexie.Promise<string[]>;

            /**
             * Get sync status for given URL. See docs at:
             * https://github.com/dfahlander/Dexie.js/wiki/db.syncable.getStatus()
             */
            getStatus(url: string): Dexie.Promise<SyncStatus>;

            /**
             * Syncable events. See docs at:
             * https://github.com/dfahlander/Dexie.js/wiki/db.syncable.on('statusChanged')
             */
            on: Dexie.Syncable.SyncableEventSet;
        }

        /**
         * Table used for storing uncommitted changes when downloading partial change sets from
         * a sync server.
         * 
         * Each change is bound to a node id (represents the remote server that the change was
         * downloaded from)
         */
        _uncommittedChanges: Dexie.Table<IDatabaseChange & {id: number, node: number}, number>;
    }

    module Dexie {

        // Extend SyncNode interface from Dexie.Observable to
        // allow storing remote nodes in table _syncNodes.
        module Observable {
            interface SyncNode {
                url: string, // Only applicable for "remote" nodes. Only used in Dexie.Syncable.                
                syncProtocol: string, // Tells which implementation of ISyncProtocol to use for remote syncing. 
                syncContext: any,
                syncOptions: any,
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
        }

        module Syncable {
            /**
             * See documentation at:
             * https://github.com/dfahlander/Dexie.js/wiki/Dexie.Syncable.registerSyncProtocol()
             */
            var registerSyncProtocol: (name: string, prototocolInstance: ISyncProtocol) => void;

            /** Translates a sync status number into a string "ERROR_WILL_RETRY", "ERROR", etc */
            var StatusTexts: {[syncStatus:number]: string};
            
            interface SyncableEventSet extends DexieEventSet {
                (eventName: 'statusChanged', subscriber: (status: number, url: string) => void): void;
            }
        }
    }
}

export default Dexie.Syncable;

