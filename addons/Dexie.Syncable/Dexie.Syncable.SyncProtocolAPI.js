/* SyncProtocol API - an independant syncronization API used by Dexie.Syncable.js.
 * Version: 1.0
 * Date: April 2014
 *
 * Implementors of ISyncProtocol may be independant on any framework. There are no dependencies to Dexie.js or Dexie.Syncable.js.
 * Likewise, consumers of ISyncProtocol instance must not be just Dexie.Syncable, but could be used in other frameworks as well.
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
 */

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
function ISyncProtocol() {
    this.sync = function (context, url, options, baseRevision, syncedRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess, onError) {
        /// <summary>
        ///		Syncronize changes between local and remote.
        /// </summary>
        /// <param name="context" type="IPersistedContext">
        ///		A context that the implementation may use for storing persistent state bound to the local database. See IPersistedContext.
        ///		The same context instance will be given for all calls to sync() as long as the URL is the same. If calling context.save(),
        ///		all properties stored on the context will be persisted in an internal table contained by the same database that is being
        ///		synced. Context instance is also cached in memory and will not be reloaded from database during the application session.
        /// </param>
        /// <param name="url" type="String">
        ///		URL of the remote node to establish a continous sync with.
        /// </param>
        /// <param name="options" type="Object">
        ///		Information needed in order to interact with server. Example of options are timeout settings, poll intervals,
        ///     authentication credentials, etc. The options are implementation specific.
        /// </param>
        /// <param name="baseRevision">
        ///		Server revision that the changes are based on. Should be used when resolving conflicts.
        ///     On initial sync, this value will be null. If having synced before, this will one of the values that has been sent
        ///     previously to applyRemoteChanges(), but not nescessarily the last value. baseRevision is persisted so it will survive a reboot.
        /// 
        ///     A revision can be of any JS type (such as Number, String, Array, Date or Object).
        ///		Remote node should use this value to know if there are conflicts. If changes on the remote node was made after this revision,
        ///		and any of those changes modified the same properties on the same objects, it must be considered a conflict and
        ///		the remote node should resolve that conflict by choosing the remote node's version of the conflicting properties unless it is a conflict
        ///     where client has deleted an object that server has updated - then the deletion should win over the update. An implementation of this
        ///     rule is defined in WebSocketSyncServer.js: function resolveConflicts().
        /// 
        ///     The difference between baseRevision and syncedRevision is:
        ///         * baseRevision: revision that given 'changes' array are based upon. Should be used by remote node when resolving conflicts.
        ///         * syncedRevision: revision that local node has already applied. Should be used by remote node when filtering which changes to send to local node.
        /// </param>
        /// <param name="syncedRevision">
        ///		Server revision that local database is in sync with already. On initial sync, this value will be null. If having synced before, this will be the same value
        ///     that were previously sent by the sync implementor to applyRemoteChanges(). syncedRevision is persisted so even after a reboot, the last value
        ///     will be remembered. A revision can be of any JS type (such as Number, String, Array, Date or Object).
        ///		Server should use this value to know which changes to send to client. Server should only send changes occurring after given syncedRevision.
        ///     If changes on the remote node was made after this revision.
        /// 
        ///     The difference between baseRevision and syncedRevision is:
        ///         * baseRevision: revision that given 'changes' array are based upon. Should be used by remote node when resolving conflicts.
        ///         * syncedRevision: revision that local node has already applied. Should be used by remote node when filtering which changes to send to local node.
        /// </param>
        /// <param name="changes" type="Array" elementType="IDatabaseChange">
        ///		Local changes to sync to remote node. This array will contain changes that has occured locally since last sync.
        ///		If this is the initial sync, framework will want to upload the entire local database to the server.
        ///     If initial sync or if having been offline for a while, local database might contain much changes to send.
        ///		Of those reasons, it is not guaranteed that ALL client changes are delivered in this first call to sync(). If number of changes are 'enormous',
        ///     the framework may choose to only apply a first chunk of changes and when onSuccess() is called by your implementation, framework will send
        ///     the remaining changes by calling sync() again, or continuation.react depending on the continuation method given in the call to onSuccess().
        ///     The argument 'partial' will tell whether all changes are sent or if it is only a partial change set. See parameter 'partial'. Note that if
        ///     partial = true, your server should queue the changes and not commit them yet but wait until all changes have been sent (partial = false).
        /// </param>
        /// <param name="partial" type="Boolean">
        ///     If true, the changes only contains a part of the changes. The part might be cut in the middle of a transaction so the changes must
        ///     not be applied until another request comes in from same client with partial = false.
        ///     A sync server should store partial changes into a temporary storage until the same client sends a new
        ///     request with partial = false. For an example of how to hande this, see WebSocketSyncServer.js under samples/remote-sync/websocket.
        /// </param>
        /// <param name="applyRemoteChanges" value="function (changes, lastRevision, partial, clear) {}">
        ///		Call this function whenever the response stream from the remote node contains new changes to apply.
        ///		Provide the array of IDatabaseChange objects as well as the revision of the last change in the change set.
        ///     If there are enormous amount of changes (would take too much RAM memory to put in a single array), you may call
        ///     this function several times with 'partial' set to true until the last set of changes arrive. The framework will
        ///     not commit the changes until method is called with partial = false or undefined.
        ///     The 'clear' argument is another optional Boolean. If set, the framework will clear all existing data before applying
        ///     changes. This flag can be useful in case the given baseRevision was too old for the server. Server may have cleared out
        ///     old revisions to save space and if clients come in with a baseRevision older than the earliest revision known by server,
        ///     server may set this flag and provide a changes array of CREATEs only for all objects in the database. Again, if the amount
        ///     of data is very big, server may send the changes in chunks setting partial to true for all chunks but the last one.
        /// </param>
        /// <param name="onChangesAccepted">
        ///		Call this function when you get an ack from the server that the changes has been recieved. Must be called no
        ///     matter if changes were partial or not partial. This will mark the changes as handled so that they need not to be sent again
        ///     to the particular remote node being synced.
        /// </param>
        /// <param name="onSuccess" value="function (continuation) {}">
        ///		Call this function when all changes you got from the server has been sent to applyRemoteChanges(). Note that
        ///     not all changes from client has to be sent or acked yet (nescessarily).
        /// 
        ///     Sample when using a poll strategy: onSuccess({again: 1000});
        ///     Sample when using an immediate reaction strategy: onSuccess({
        ///         react: function (changes, baseRevision, partial, onChangesAccepted) {
        ///             // Send changes, baseRevisoin and partial to server
        ///             // When server acks, call onChangesAccepted();
        ///         },
        ///         disconnect: function () {
        ///             // Disconnect from server!
        ///         }
        ///     });
        ///		
        ///		The given continuation object tells the framework how to continue syncing. Possible values are:
        ///		{ again: milliseconds } - tells the framework to call sync() again in given milliseconds.
        ///		{ react: onLocalChanges, disconnect: disconnectFunction } - tells the framework that you will continue
        ///	    listening on both client- and server changes simultanously. When you get changes from server, you will
        ///		once again call	applyRemoteChanges() and when client changes arrive, you will get notified in your
        ///     'react' function: function onLocalChanges(changes, baseRevision, partial, onChangesAccepted).
        ///		When the framework want to close down your provider, it will call your provided disconnect function.
        ///		Note that the disconnect function is only required when using the 'react' pattern. This is because
        ///		the 'again' pattern is always initiated by the framework.
        /// 
        ///		Note that onSuccess() must only be called once. If continuing using the 'react' pattern, you will
        ///		no more call onSuccess(). (If using the 'again' pattern, the next call will be to sync() again and
        ///     thus the same implementation as initial sync and therefore you must call onSuccess() again).
        /// </param>
        /// <param name="onError" value="function (error, again) {}">
        ///		Call this function if an error occur. Provide the error object
        ///		(exception or other toStringable object such as a String instance) as well as the again value that
        ///		should be number of milliseconds until trying to call sync() again.
        /// 
        ///     For repairable errors, such as network down, provide a value for again so that the framework may
        ///     try again later. If the error is non-repairable (wouldnt be fixed if trying again later), you
        ///     should provide Infinity, null or undefined as value for the again parameter.
        /// 
        ///		If an error occur while listening for server changes after having gone over to the 'react' pattern,
        ///		you may also call onError() to inform the framework that the remote node has gone down. If doing so,
        ///		your sync call will be terminated and you will no longer recieve any local changes to your 'react'
        ///		callback. Instead you inform the framework about the number of milliseconds until it should call
        ///		sync() again to reestablish the connection. 
        /// </param>
    }
}


/** Interface of a change object.
  * 
  * There are three possible change types: 1 = CREATE, 2 = UPDATE and 3 = DELETE.
  * For CREATE:
  *		this.obj will contain the object to create.
  * For UPDATE:
  *		this.mods will contain a set of keyPaths within existing object and the new values to set.
  *		A keyPath is the path to a property in an existing object. If the property is not nested,
  *		the keyPath will simply be the name of the property. For nested properties, the keyPath
  *		will contain periods ('.') that points out the nested property.
  *		Example:
  *			var friend = {key: "abc123", name: "Freddy", address: { street: "Elm Street", city: "Podsdam" } }
  *			var change = {type: 2, table: "friends", key: "abc123", mods: { "address.city": "Podsdam, New York" } }
  *			// Assume we have an applyChange() function that would apply a change to given object:
  *			applyChange (friend, change);
  *			// friend.address.city would now have been updated to "Podsdam, New York".
  * For DELETE:
  *		Only this.table and this.key points out the object to delete.
  *
  */
function IDatabaseChange() {
    this.type = new Number();   // Type of change (Create = 1, Update = 2 or Delete = 3)
    this.table = new String();	// Table name
    this.key = new Object();    // Primary key to change
    this.obj = new Object();	// Object being created. Only applicable when type=1 (CREATE)
    this.mods = new Object();	// Modifications to update object with. This is a set of keyPaths to modify and the new values to set. Only applicable when type=2 (UPDATE).
}

/** Enum DatabaseChangeType.
  *
  */
var DatabaseChangeType = {
	CREATE: 1,
	UDPATE: 2,
	DELETE: 3
};

/** interface IPersistedContext
    *
    * Context that the ISyncProtocol implementor may use to store persistant state info within.
    *
    * ISyncProtocol may store any custom properties on the persistedContext and call save() to persist them.
	*
	* Typically, this context could be used to save an identifyer for this particular local node agains the remote node.
	* The remote node may then mark the changes applied by this node so that those changes are ignored when sending back its changes
	* to you. In case the local database is deleted, 
	*
	* The context is saved in a special internal table within the same local database as you are syncing. If the database
	* is deleted, so will you context be.
    * 
    * Implemented by framework.
    * 
    */
function IPersistedContext() {
    this.save = function () {
        /// <summary>
        ///	  Persist your context object to local database. When done, the returned promise will resolve.
        ///	  You may only store primitive types, objects and arrays in this context. You may not store functions
        ///	  or DomNodes.
        /// </summary>
        /// <returns type="Promise">Returns Promise with methods then() and catch() to call if in need to wait
        ///  for the result of the save() operation.
        /// </returns>
    }
}

