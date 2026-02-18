
- [v] Bug: we're always resolving BlobRefs to Uint8Array but it could be a Blob, ArrayBuffer or other binary type. The exact type should have been stored in the TSON structure. Now it's $t: "Blob". Probably that is misleading and we should call it BlobRef for this.
- Continue review the rest of the code

# Reviewed files in the ongoing PR

- [v] .github/workflows/publish-ci.yml
- [v] addons/dexie-cloud/src/sync/BlobSavingQueue.ts
- [v] addons/dexie-cloud/src/sync/blobResolve.ts
- [v] addons/dexie-cloud/src/middlewares/blobResolveMiddleware.ts
  - [v] openCursor
  - [v] get
  - [v] getMany
  - [v] query
- [v] addons/dexie-cloud/src/DexieCloudAPI.ts
- [v] addons/dexie-cloud/src/DexieCloudOptions.ts
- [v] addons/dexie-cloud/src/dexie-cloud-client.ts
- [v] addons/dexie-cloud/src/overrideParseStoresSpec.ts
- [v] addons/dexie-cloud/src/sync/eagerBlobDownloader.ts
- [v] samples/dexie-cloud-todo-app/src/db/TodoDB.ts
- [v] addons/dexie-cloud/src/sync/blobProgress.ts
- [v] addons/dexie-cloud/src/sync/syncWithServer.ts ()
- [ ] addons/dexie-cloud/src/sync/applyServerChanges.ts (light)
- [ ] addons/dexie-cloud/src/sync/sync.ts (medium)
- [ ] addons/dexie-cloud/src/sync/blobOffloading.ts (extensive)
- [ ] docs/CI-PUBLISHING.md

# Optimize middleware to skip intercepting when not nescessary:

- [ ] In applyServerChanges transaction, let syncState reflect which tables that have unresolved blobs, also let this momentarily be reflected in a memory set.
- [ ] In the end of eager blob downloader, do a transaction that verifies all blobs are resolved and then remove the tables from the sync state. Within that same transaction, reset memory set.
- [ ] in dexie-cloud-client, on-ready event, populate the memory set from sync state.
- [ ] In middleware, skip doing the blob dance if the requested table isn't listed in the memory set.

# Things to solve on the server instead:
- [ ] markUnresolvedBlobRefs(). Let server send $unresolved in the changes. Why? because ALL objects are deeply walked on initial load otherwise. Server knows when when a BlobRef is set. Persist $unresolved in the DB. Useful in REST API as well so that REST clients doesn't need to check it either.
