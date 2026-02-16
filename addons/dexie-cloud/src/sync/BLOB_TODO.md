
- Bug: we're always resolving BlobRefs to Uint8Array but it could be a Blob, ArrayBuffer or other binary type. The exact type should have been stored in the TSON structure. Now it's $t: "Blob". Probably that is misleading and we should call it BlobRef for this.
- We're providing Authorization header when uploading blobs. Shouldn't we use signed URLs?
- Continue review the rest of the code:

# Reviewed files in the ongoing PR

- [v] .github/workflows/publish-ci.yml
- [v] addons/dexie-cloud/src/sync/BlobSavingQueue.ts
- [v] addons/dexie-cloud/src/sync/blobResolve.ts
- [v] addons/dexie-cloud/src/middlewares/blobResolveMiddleware.ts
  - [v] openCursor
  - [v] get
  - [v] getMany
  - [v] query
- [ ] addons/dexie-cloud/src/DexieCloudAPI.ts
- [ ] addons/dexie-cloud/src/DexieCloudOptions.ts
- [ ] addons/dexie-cloud/src/dexie-cloud-client.ts
- [ ] addons/dexie-cloud/src/overrideParseStoresSpec.ts
- [ ] addons/dexie-cloud/src/sync/applyServerChanges.ts
- [ ] addons/dexie-cloud/src/sync/blobOffloading.ts
- [ ] addons/dexie-cloud/src/sync/blobProgress.ts
- [ ] addons/dexie-cloud/src/sync/eagerBlobDownloader.ts
- [ ] addons/dexie-cloud/src/sync/sync.ts
- [ ] addons/dexie-cloud/src/sync/syncWithServer.ts
- [ ] docs/CI-PUBLISHING.md
- [ ] samples/dexie-cloud-todo-app/src/db/TodoDB.ts

