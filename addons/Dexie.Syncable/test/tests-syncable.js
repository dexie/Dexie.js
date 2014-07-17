///<reference path="test-syncable.html" />
(function () {

    /* The following is being tested:

        1. A dummy implementation of ISyncProtocol is registered so that the unit test can interact with the database correctly.
    */
	var db1 = new Dexie("db1");
	var db2 = new Dexie("db1");
	//var syncServer = new SyncServer(12936);
	//syncServer.start();
	var deletePromise = Dexie.delete("db1");

	module("tests-syncable", {
	    setup: function () {
	        db1.close();
	        db2.close();
			stop();
			deletePromise.then(start);
		},
		teardown: function () {
		}
	});
	
	asyncTest("connect(), disconnect()", function () {
		var testNo = 0;
		var callbacks = [];
		Dexie.Syncable.registerSyncProtocol("testProtocol", {
			sync: function (context, url, options, baseRevision, syncedRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess, onError) {
			    var thiz = this, args = arguments;
			    Dexie.vip(function () {
			        try {
			            callbacks[testNo++].apply(thiz, args);
			        } catch (err) {
			            db1.close();
			            ok(false, err);
			            start();
			        }
			    });
			}
		});

		db1.version(1).stores({ objects: "$$" });
		db2.version(1).stores({ objects: "$$" });

		db1.on('populate', function () {
			db1.objects.add({ name: "one" });
			db1.objects.add({ name: "two" });
			db1.objects.add({ name: "three" }).then(function (key) {
				db1.objects.update(key, {name: "four"});
			});
		});
		db1.on('error', function onError (err) {
			db1.on('error').unsubscribe(onError);
			db1.close();
			ok(false, err);
			start();
		});
		db1.syncable.on('statusChanged', function (newStatus) {
			ok(true, "Status changed to " + Dexie.Syncable.StatusTexts[newStatus]);
		});
		db2.syncable.on('statusChanged', function (newStatus) {
			ok(true, "Status changed to " + Dexie.Syncable.StatusTexts[newStatus]);
		});

		var connectPromise = db1.syncable.connect("testProtocol", "http://dummy.local", { option1: "option1" });

		db1.open();

		callbacks.push(function (context, url, options, baseRevision, syncedRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess, onError) {
			// url
			equal(url, "http://dummy.local", "URL got through");
			// options
			equal(options.option1, "option1", "Options got through");
			// baseRevision
			equal(baseRevision, null, "Base revision is null");
			// syncedRevision
			equal(syncedRevision, null, "Sync revision is null");
			// changes
			equal(changes.length, 3, "Three changes (change number four should be reduced into change no 3");
			ok(changes.every(function (change) { return change.type == 1 }), "All three changes are create changes");
			ok(changes.some(function (change) { return change.obj.name == "one" }), "'one' is among changes");
			ok(changes.some(function (change) { return change.obj.name == "two" }), "'two' is among changes");
			ok(changes.some(function (change) { return change.obj.name == "four" }), "'four' is among changes");
			/*equal(changes[0].obj.name, "one", "First change is one");
			equal(changes[1].obj.name, "two", "Second change is two");
			equal(changes[2].obj.name, "four", "Third change is four");*/
			// partial
			equal(partial, false, "Not partial since number of changes are below 1000");
			// applyRemoteChanges
			applyRemoteChanges([{ type: 1, table: "objects", key: "apa", obj: { name: "five" } }], "revision one", false, false).then(function () {
				// Create a local change between remoteChanges application
				return db1.objects.add({ name: "six" });
			}).then(function () {
				return applyRemoteChanges([{ type: 1, table: "objects", key: "apa2", obj: { name: "seven" } }], "revision two", false, false);
			}).then(function () {
				// onChangesAccepted
				onChangesAccepted();
				return db1.objects.add({ name: "eight" });
			}).then(function () {
				// onSuccess
				onSuccess({ again: 1 });
			});
		});

		connectPromise.then(function () {
			db1.objects.count(function (count) {
				equal(count, 7, "There should be seven objects in db after sync");
				// From populate:
				// 1: one
				// 2: two
				// 3: four
				// 4: applyRemoteChanges: "five" ("apa")
				// 5: db.objects.add("six")
				// 6: applyRemoteChanges: "seven" ("apa2")
				// 7: db.objects.add("eight");
			});
			db1.objects.get("apa2", function (seven) {
				equal(seven.name, "seven", "Have got the change from the server. If not, check that promise does not fire until all changes have committed.");
			});
		}).catch(function (err) {
			alert(err.stack || err);
		});

		callbacks.push(function (context, url, options, baseRevision, syncedRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess, onError) {
			// url
			equal(url, "http://dummy.local", "URL still there");
			// options
			equal(options.option1, "option1", "Options still there");
			// baseRevision
			equal(baseRevision, "revision one", "First chunk of changes is based on revision one because 'six' was created based on revision one");
			// syncedRevision
			equal(syncedRevision, "revision two", "Sync revision is 'revision two' because client has got it");
			// changes
			equal(changes.length, 1, "Even though there's two changes, we should only get the first one because they are based on different revisions");
			equal(changes[0].obj.name, "six", "First change is six");
			equal(partial, false);
			onChangesAccepted();
			onSuccess({again: 1});
		});

		callbacks.push(function (context, url, options, baseRevision, syncedRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess, onError) {
			// baseRevision
			equal(baseRevision, "revision two", "Now we get changes based on revision two");
			// syncedRevision
			equal(syncedRevision, "revision two", "Sync revision is 'revision two' because client has got it");
			// changes
			equal(changes.length, 1, "Got another change");
			equal(changes[0].obj.name, "eight", "change is eight");
			equal(partial, false);
			onChangesAccepted();
			db1.transaction('rw', db1.objects, function () {
				for (var i = 0; i < 1001; ++i) {
					db1.objects.add({ name: "bulk" });
				}
			}).then(function () {
				onSuccess({ again: 1 });
			});
		});

		callbacks.push(function (context, url, options, baseRevision, syncedRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess, onError) {
			// baseRevision
			equal(baseRevision, "revision two", "Now we get changes based on revision two");
			// syncedRevision
			equal(syncedRevision, "revision two", "Sync revision is 'revision two' because client has got it");
			// changes
			equal(changes.length, 1000, "Got 1000 changes");
			equal(changes[0].obj.name, "bulk", "change is bulk");
			equal(partial, true, "More than 1000 changes gives partial=true");
			onChangesAccepted();
			onSuccess({ again: 1 });
		});

		callbacks.push(function (context, url, options, baseRevision, syncedRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess, onError) {
			// baseRevision
			equal(baseRevision, "revision two", "Now we get changes based on revision two");
			// syncedRevision
			equal(syncedRevision, "revision two", "Sync revision is 'revision two' because client has got it");
			// changes
			equal(changes.length, 1, "Got 1 change");
			equal(changes[0].obj.name, "bulk", "change is bulk");
			equal(partial, false, "Last chunk with 1 change");
			onChangesAccepted();

			// Test disconnect()
			db1.syncable.disconnect("http://dummy.local");
			onSuccess({ again: 1 }); // Framework should ignore again: 1 since it's disconnected.
			setTimeout(reconnect, 500);
			db1.objects.add({name: "changeAfterDisconnect"});
		});

		function reconnect() {
			db1.close();
			db1 = db2;
			db1.open().then(function () {
				return db1.objects.add({ name: "changeBeforeReconnect" });
			}).then(function () {
				return db1.syncable.getStatus("http://dummy.local", function (status) {
					equal(status, Dexie.Syncable.Statuses.OFFLINE, "Status is OFFLINE");
				});
			}).then(function(){
				db1.syncable.connect("testProtocol", "http://dummy.local");
			});
		}

		callbacks.push(function (context, url, options, baseRevision, syncedRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess, onError) {
			// baseRevision
			equal(baseRevision, "revision two", "baseRevision Still revision two");
			// syncedRevision
			equal(syncedRevision, "revision two", "syncedRevision Still revision two");
			// changes
			equal(changes.length, 2, "Got 2 changes after reconnect.");
			equal(changes[0].obj.name, "changeAfterDisconnect", "change one is changeAfterDisconnect");
			equal(changes[1].obj.name, "changeBeforeReconnect", "change two is changeBeforeReconnect");
			onChangesAccepted();

			onSuccess({ again: 100000 }); // Wait a looong time for calling us again (so that we have the time to close and reopen and then force a sync sooner)

			setTimeout(function () {
				db1.syncable.getStatus("http://dummy.local", function (status) {
					equal(status, Dexie.Syncable.Statuses.ONLINE, "Status is ONLINE");
				}).then(function () {
					// Close and open again and it will be status connected at once
					db1.close();
					db1 = new Dexie("db1");
					db1.version(1).stores({objects: "$$"});

					var providerWasCalled = false;
					callbacks.push(function (context, url, options, baseRevision, syncedRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess, onError) {
						providerWasCalled = true;
						// changes
						equal(changes.length, 0, "Got zero changes after reconnect.");
						applyRemoteChanges([], "revision three", false, false);
						db1.syncable.getStatus("http://dummy.local", function (status) {
							equal(status, Dexie.Syncable.Statuses.CONNECTING, "Status is CONNECTING now when being in provider and DB is currently being reopened.");
						}).then(function () {
							onSuccess({ again: 100000 });
						}).catch(function (err) {
							alert(err.stack || err);
						});
					});
					db1.open().then(function () {
						ok(providerWasCalled, "Provider was called before open() resolved");

						// For now, stop here. TODO:
						//   1. Test delete(url): Call delete() and then connect again. You should now get ALL data from local (the 1001 objects plus the others)
						//   2. Test setFilter(): Call delete() again, set a filter that ignores all objects but one. Then call connect() again and you should get just the one object.
						//   3. Test list(): Do it early in this asyncTest after first connect. Do it after disconnect() to make sure it's still there. And after delete() to make sure it's gone.
						db1.delete().then(start);
					}).catch(function (err) {
						alert(err.stack || err);
					});
				});
			}, 100);
		});

	});

})();