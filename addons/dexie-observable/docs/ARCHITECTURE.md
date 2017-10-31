dexie-observable is a rewrite of Dexie.Observable with a new architecture.

* Skip proprietary inter-node communication. This feature is only needed for Dexie.Syncable but was implemented in Dexie.Observable as a kind of "base framework". Next version of dexie-syncable will let the master node live in a service worker instead.
* Track changes per table to avoid locking all tables on each transaction.
* A more compressed oplog format.
* Implement an standard Observable interface to subscribe to (besides on('changes'))

Skip using SharedWorker for several reasons:

1. It would require the library consumer to setup a worker.js
2. It is not supported by Edge or Safari
3. It complicates things.
4. Instant notification on changes is a typical GUI use case (not for background workers)

So what we basically need to do offer in this addon is:

* A "changes" event per table.
* ~~Communicate through a SharedWorker~~
* Wakeup other windows/tabs using the Storage event (wont work in Workers)
* When Storage event is not possible (Workers), use polling.
* Let the oplog be bidirectional (undo-support)
* Let oplog be prepared for operational transformations (OT) operations insert/delete on string properties.
