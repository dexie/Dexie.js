// Type definitions for dexie-syncable v{version}
// Project: https://github.com/dfahlander/Dexie.js/tree/master/addons/Dexie.Syncable
// Definitions by: David Fahlander <http://github.com/dfahlander>

import Dexie, { DexieEventSet } from 'dexie';
import 'dexie-observable';
import { ISyncProtocol, SyncStatus } from '../api';
import {IDatabaseChange} from 'dexie-observable/api';


export interface SyncableEventSet extends DexieEventSet {
    (eventName: 'statusChanged', subscriber: (status: number, url: string) => void): void;
}

//
// Extend Dexie interface
//
declare module 'dexie' {
    interface Dexie {
        syncable: {
            version: string;
            /**
             * Connect to given URL using given protocol and options. See documentation at:
             * https://github.com/dfahlander/Dexie.js/wiki/db.syncable.connect()
             */
            connect(protocol: string, url: string, options?: any): Dexie.Promise<void>;

            /**
             * Stop syncing with given url.. See docs at:
             * https://github.com/dfahlander/Dexie.js/wiki/db.syncable.disconnect()
             */
            disconnect(url: string): Dexie.Promise<void>;

            /**
             * Stop syncing and delete all sync state for given URL. See docs at:
             * https://github.com/dfahlander/Dexie.js/wiki/db.syncable.delete()
             */
            delete(url: string): Dexie.Promise<void>;

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
            on: SyncableEventSet;
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

    interface DexieConstructor {
        Syncable: {
            (db: Dexie) : void;

            version: string;

            /**
             * See documentation at:
             * https://dexie.org/docs/Syncable/Dexie.Syncable.registerSyncProtocol()
             */
            registerSyncProtocol: (name: string, prototocolInstance: ISyncProtocol) => void;

            /** Translates a sync status number into a string "ERROR_WILL_RETRY", "ERROR", etc */
            StatusTexts: {[syncStatus:number]: string};
        }
    }
}

//
// Extend dexie-observable interfaces
//
declare module "dexie-observable" {
    // Extend SyncNode interface from Dexie.Observable to
    // allow storing remote nodes in table _syncNodes.
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

export default Dexie.Syncable;

