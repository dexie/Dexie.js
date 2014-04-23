/** ISyncProviderFactory
  */
function ISyncProviderFactory() {
    this.create = function (persistedContext, localDatabase) {
        /// <summary>
        ///     Return an instance of ISyncProvider initialized with given persistedContext and localDatabase instance.
        /// </summary>
        /// <param name="persistedContext" type="IPersistedContext">Context where to read and store states into. Persistent using its save() method.</param>
        /// <param name="localDatabase" type="ILocalDatabase" optional="true">If not null, implementor should retrieve changes from server and store into database.
    }
}

/* ISyncProvider

   Implementors of ISyncProvider should be independant on Dexie and only dependant on its own protocol.
*/
function ISyncProvider() {
	this.connect = function (url, options) {
        /// <summary>
        ///     Connect to server and retrieve all server changes and store into the localDatabase instance provided in the create() method of your ISyncProviderFactory.
        ///     Resolve returned Promise when all remote changes have been applied to local database using the create(), update() and delete() methods of your ILocalDatabase
        ///     instance.
        /// 
    	///     If an error occur, or if remote server is unavailable, reject the returned Promise.
    	/// 
		///		After resolving the returned promise, in case options.continously == true, the implementation should
		///     also use setTimeout(), setInterval(), WebSocket or similar to continously observe additional changes
		///     from the remote server and use the ILocalDatabase instance to apply those changes continously.
    	/// 
        /// </summary>
		/// <param name="url" type="String">URL to connect to</param>
		/// <param name="options" value="{direction: 'localToRemote', 'remoteToLocal' or 'bidirectional', continous: true or false}">Options for syncing</param>
		/// <returns type="IThenable">A promise that resolves when all known changes have been exchanged successfully and acknowledged by the server. If operations fails, returned promise should reject.</returns>
    }

    this.disconnect = function () {
    	/// <summary>
    	///		Stop syncronizing. Implementation should set an internal flag to stop syncronizing with the server.
    	///		Any pending setTimeout() or setInterval() must be cleared.
    	/// </summary>
    }

    this.onLocalChange = function () {
    	/// <summary>
    	///     If connected with options.continous = true and options.direction is 'bidirectional' or 'localToRemote', this
    	///     method will be called by the framework whenever new local changes are available.
    	///     Implementor can then call localDatabase.getChanges() to retrieve available changes.
    	///     When implementor have successfully forwarded all these changes to the remote server and got
    	///     an acknowledgement from the server, caller must call onhandled() provided as 2nd argument to the getChanges() callback.
    	/// 
    	///     onLocalChange will never be called more than once within a time frame of 25 milliseconds. If for example 1000 changes are made
    	///     to the local database during a short time frame, onLocalChange() will only be called once.
    	/// 
    	///     The implementor does not have to implement this method. If for example, the implementor rather wants to sync using a poll interval,
    	///		that can be accomplished without the help of this method. However, if implementor uses WebSockets or similar, this method will ensure
    	///		that local changes will be synced to the server as soon as possible.
    	/// 
    	/// </summary>
    }
}

/** Interface IThenable.
    *
    * The common interface for all Promise implementations. Whenever you must return an instance of IThenable, you may use any Promise
    * implementation that fullfills this interface.
    * One such implementation is Dexie.Promise. In Mozilla browser, there is also a built-in Promise implementation window.Promise based on EcmaScript 6
    * specification.
    */
function IThenable() {
    this.then = function (onResolved, onRejected) {}
}

/** Change information from local database to sync towards remote server.
    *
    * Implemented by framework.
    *
    */
function IDatabaseChange() {
    this.type = new Number();   // 1 = CREATE, 2 = UPDATE, 3 = DELETE
    this.table = new String();	// Table name
    this.key = new Object();    // Primary key to change
    this.mods = new Object();   // Modifications. Only applicable for CREATE (mods is the object) and UPDATE (mods is the keyPaths and values). On DELETE, mods = null.
}

/** interface IPersistedContext
    *
    * Context that the ISyncProvider implementor may use to store persistant state info within.
    *
    * ISyncProvider may store any custom properties on the persistedContext and call save() to persist them.
    * 
    * Implemented by framework.
    * 
    */
function IPersistedContext() {
}

/** save() - Persists the object to local disk.
  */
IPersistedContext.prototype.save = function () {}

/** interface ILocalDatabase 
    * 
    * Implemented by framework.
    *
    * Allows creating, updating an deleting objects on the local database. 
    */
function ILocalDatabase() {
    this.create = function (table, key, obj) {
        /// <summary>
        ///   Create object in given table
        /// </summary>
        /// <param name="table"></param>
        /// <param name="key"></param>
        /// <param name="obj"></param>
    }
    this.update = function (table, key, modifications) {
        /// <summary>
        ///   Update object with given key in given table with given modifications.
        /// </summary>
        /// <param name="table" type="String">Table name</param>
        /// <param name="key">Primary key of object to update</param>
        /// <param name="modifications" type="Object">Pairs of property paths and values. If value is undefined, property is deleted.</param>
    }
    this.delete = function (table, key) {
        /// <summary>
        ///     Delete object with given key from given table.
        /// </summary>
        /// <param name="table"></param>
        /// <param name="key"></param>
    }
    this.getChanges = function (callback) {
        // Example:
        //
        // localDB.getChanges(function(changes, onhandled) {
        //     changes.forEach(function(change) {
        //         // Send the change to server.
        //     });
        //     // Wait for server to respond successfully,
        //     // Then, call onhandled();
    	// });
    	//
    	// NOTE: It is very important to call onhandled() when remote server accepts our changes. Otherwise
    	// the framework will keep returning the same changes over and over. By calling onhandled() you acknowledge
    	// that the retrieved changes were handled and that the framework does not need to keep saving those changes anymore.
    	// After onhandled() has been called, the changes may be deleted from the locally persisted change queue (if there are no other
		// sync providers active).
    }
}
