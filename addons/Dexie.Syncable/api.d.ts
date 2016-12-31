/* dexie-syncable API - an independant syncronization API used by 'dexie-syncable'.
 * Version: 1.1
 * Date: December 2016
 *
 * Some assumptions are made upon how the database is structured though. We assume that:
 *  * Databases has 1..N tables. (For NOSQL databases without tables, this also works since it could be considered a db with a single table.)
 *  * Each table has a primary key.
 *	* The primary key is a UUID of some kind since auto-incremented primary keys are not suitable for syncronization
 *    (auto-incremented key would work but changes of conflicts would increase on create).
 *  * A database record is a JSON compatible object.
 *  * Always assume that the client may send the same set of changes twice. For example if client sent changes that server stored, but network went down before
 *    client got the ack from server, the client may try resending same set of changes again. This means that the same Object Create change may be sent twice etc.
 *    The implementation must not fail if trying to create an object with the same key twice, or delete an object with a key that does not exist.
 *  * Client and server must resolve conflicts in such way that the result on both sides are equal.
 *  * Since a server is the point of the most up-to-date database, conflicts should be resolved by prefering server changes over client changes.
 *    This makes it predestinable for client that the more often the client syncs, the more chance to prohibit conflicts.
 *
 * By separating module 'dexie-syncable' from 'dexie-syncable/api' we
 * distinguish that:
 * 
 *   import {...} from 'dexie-syncable/api' is only for getting access to its
 *                                          interfaces and has no side-effects.
 *                                          Typescript-only import.
 * 
 *   import 'dexie-syncable' is only for side effects - to extend Dexie with
 *                           functionality of dexie-syncable.
 *                           Javascript / Typescript import.
 * 
 */

import {IDatabaseChange} from 'dexie-observable/api';
export type IDatabaseChange = IDatabaseChange;
export enum DatabaseChangeType {
    Create = 1,
    Update = 2,
    Delete = 3
}


/* ISyncProtocol

   Interface to implement for enabling syncronization with a remote database server. The remote database server may be SQL- or NOSQL based
   as long as it is capable of storing JSON compliant objects into some kind of object stores and reference them by a primary key.
   The server must also be revision- and changes aware. This is something that for many databases needs to be implemented by a REST- or
   WebSocket gateway between the client and the backend database. The gateway can act as a controller and make sure any changes
   are registered in the 'changes' table and that the API provides a sync() method to interchange changes between client and server.

   Two examples of a ISyncProtocol instances are found in:
       https://github.com/dfahlander/Dexie.js/tree/master/samples/remote-sync/ajax/AjaxSyncProtocol.js
       https://github.com/dfahlander/Dexie.js/tree/master/samples/remote-sync/websocket/WebSocketSyncProtocol.js

*/

/**
 * The interface to implement to provide sync towards a remote server.
 * 
 * Documentation for this interface: https://github.com/dfahlander/Dexie.js/wiki/Dexie.Syncable.ISyncProtocol
 * 
 */
export interface ISyncProtocol {
    partialsThreshold?: number;
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
export interface IPersistedContext {
    save() : Promise<void>;
    [customProp: string] : any;
}

/**
 * Documentation for this function: https://github.com/dfahlander/Dexie.js/wiki/Dexie.Syncable.ISyncProtocol
 */
export type ApplyRemoteChangesFunction = (
    changes: IDatabaseChange[],
    lastRevision: any,
    partial?: boolean,
    clear?: boolean)
    => Promise<void>;

/**
 * Provide a poll continuation if your backend is a reqest/response service, such as a REST API.
 */
export interface PollContinuation {
    /** Implementation should return number of milliseconds until you want the framework to call sync() again. */
    again: number
}

/**
 * Provide a reactive continuation if your backend is connected to over WebSocket, socket-io, signalR or such,
 * and may push changes back to the client as they occur.
 */
export interface ReactiveContinuation {
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

export enum SyncStatus {
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
    SYNCING = 3,

    /** An error occured such as net down but the sync provider will retry to connect. */
    ERROR_WILL_RETRY = 4
}
