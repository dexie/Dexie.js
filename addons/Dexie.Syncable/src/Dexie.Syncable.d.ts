// Type definitions for dexie-syncable v{version}
// Project: https://github.com/dfahlander/Dexie.js/tree/master/addons/Dexie.Syncable
// Definitions by: David Fahlander <http://github.com/dfahlander>

import Dexie from 'dexie';
import 'dexie-observable';

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
            getStatus(url: string): Dexie.Promise<Dexie.Syncable.SyncStatus>;

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
        _uncommittedChanges: Dexie.Table<Dexie.Observable.IDatabaseChange & {id: number, node: number}, number>;
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
             * https://github.com/dfahlander/Dexie.js/wiki/Dexie.Syncable.IDatabaseChange
             */
            type IDatabaseChange = Dexie.Observable.IDatabaseChange;

            /**
             * See documentation at:
             * https://github.com/dfahlander/Dexie.js/wiki/Dexie.Syncable.registerSyncProtocol()
             */
            var registerSyncProtocol: (name: string, prototocolInstance: ISyncProtocol) => void;

            enum SyncStatus {
                /** An error occured such as net down but the sync provider will retry to connect. */
                ERROR_WILL_RETRY = -2,

                /** An irrepairable error occurred and the sync provider is dead. */
                ERROR = -1,

                /** The sync provider hasnt yet become online, or it has been disconnected. */
                OFFLINE = 0,

                /** Trying to connect to server */
                CONNECTING = 1,

                /** Connected to server and currently in sync with server */
                ONLINE = 2,

                /** Syncing with server. For poll pattern, this is every poll call.
                 * For react pattern, this is when local changes are being sent to server. */
                SYNCING = 3
            }

            /** Translates a sync status number into a string "ERROR_WILL_RETRY", "ERROR", etc */
            var StatusTexts: {[syncStatus:number]: string};

            /**
             * The interface to implement to provide sync towards a remote server.
             * 
             * Documentation for this interface: https://github.com/dfahlander/Dexie.js/wiki/Dexie.Syncable.ISyncProtocol
             * 
             */
            interface ISyncProtocol {
                sync (
                    context: IPersistedContext,
                    url: string,
                    options: any,
                    baseRevision: any,
                    syncedRevision: any,
                    changes: IDatabaseChange[],
                    partial: boolean,
                    applyRemoteChanges: ApplyRemoteChangesFunction,
                    onChangesAccepted: ()=>void,
                    onSuccess: (continuation: PollContinuation | ReactiveContinuation)=>void,
                    onError: (error: any, again?: number) => void) : void;
            }

            /**
             * Documentation for this interface: https://github.com/dfahlander/Dexie.js/wiki/Dexie.Syncable.IPersistedContext
             */
            interface IPersistedContext {
                save() : Promise<void>;
                [customProp: string] : any;
            }

            /**
             * Documentation for this function: https://github.com/dfahlander/Dexie.js/wiki/Dexie.Syncable.ISyncProtocol
             */
            type ApplyRemoteChangesFunction = (
                changes: IDatabaseChange[],
                lastRevision: any,
                partial?: boolean,
                clear?: boolean)
                => Promise<void>;
            
            /**
             * Provide a poll continuation if your backend is a reqest/response service, such as a REST API.
             */
            interface PollContinuation {
                /** Implementation should return number of milliseconds until you want the framework to call sync() again. */
                again: number
            }

            /**
             * Provide a reactive continuation if your backend is connected to over WebSocket, socket-io, signalR or such,
             * and may push changes back to the client as they occur.
             */
            interface ReactiveContinuation {
                react (
                    /** List of local changes to send to server. */
                    changes: IDatabaseChange[],

                    /** Server revision that server needs to know in order to apply the changes correcly.  */
                    baseRevision: any,

                    /** If true, it means that reach() will be called upon again with additional changes once you'version
                     * called onChangesAccepted(). An implementation may handle this transactionally, i.e. wait with applying
                     * these changes and instead buffer them in a temporary table and the apply everything once reac() is called 
                     * with partial=false.
                     */
                    partial: boolean,

                    /** Callback to call when the given changes has been acknowledged and persisted at the server side.
                     * This will mark the change-set as delivered and the framework wont try resending these changes anymore.
                     */
                    onChangesAccepted: ()=>void): void;

                /** Implementation should disconned the underlying transport and stop calling applyRemoteChanges(). */
                disconnect(): void;
            }

            interface SyncableEventSet extends DexieEventSet {
                (eventName: 'statusChanged', subscriber: (status: number, url: string) => void): void;
            }
        }
    }
}

export default Dexie.Syncable;

