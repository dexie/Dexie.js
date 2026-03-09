
- [v] Bug: we're always resolving BlobRefs to Uint8Array but it could be a Blob, ArrayBuffer or other binary type. The exact type should have been stored in the TSON structure. Now it's $t: "Blob". Probably that is misleading and we should call it BlobRef for this.
- Continue review the rest of the code

# Beta Checklist

- [x] ~~Remove `blobRefAwareTypeDefs` from TSON.ts~~ NOT NEEDED — these are required for lazy/eager blob resolution
- [ ] Unskip lazy mode E2E test and verify it passes
- [ ] Unskip blobProgress E2E test and verify it passes
- [ ] David: review & merge PR #2255 (Dexie.js) + PR #75 (dexie-cloud)
- [ ] Debug logging via `DEXIE_CLOUD_DEBUG` env var / `__DEBUG__` rollup guards (nice-to-have)

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
- [v] addons/dexie-cloud/src/sync/applyServerChanges.ts (light)
- [v] addons/dexie-cloud/src/sync/blobOffloading.ts (extensive)
- [v] addons/dexie-cloud/src/sync/sync.ts (medium)
- [v] docs/CI-PUBLISHING.md

# Error handling
- [ ] eagerBlobDownloader: see line 114 TODO. Depending on error, retry or stop trying. Maybe only retry N times over a time period of T. Right now, it will continue with next object and retry next time over and over.

# Optimize middleware to skip intercepting when not necessary:

- [ ] In applyServerChanges transaction, let syncState reflect which tables that have unresolved blobs, also let this momentarily be reflected in a memory set.
- [ ] In the end of eager blob downloader, do a transaction that verifies all blobs are resolved and then remove the tables from the sync state. Within that same transaction, reset memory set.
- [ ] in dexie-cloud-client, on-ready event, populate the memory set from sync state.
- [ ] In middleware, skip doing the blob dance if the requested table isn't listed in the memory set.

# Refactoring To-dos
- [v] Rename `$unresolved` to `$hasBlobRefs` as it is more explanatory
- [x] Rename `$t` → `_bt` and `$hasBlobRefs` → `_hasBlobRefs` (done 2026-03-09)
- [x] Remove BlobRef-aware TSON type defs — TSON is transparent to BlobRefs (done 2026-03-09)
- [ ] Move `BlobRef.ts` from `dexie-cloud-common/src/tson/types/` to `dexie-cloud-common/src/blob/` — it has nothing to do with TSON
- [ ] Consolidate `isBlobRef` into one place in `dexie-cloud-common/src/blob/` — currently duplicated in client (`blobResolve.ts`), server (`BlobRefManager.ts`, `getObjectDiff.ts`, `expandBlobRefsForExport.ts`, `validateImportData.ts`) and E2E tests
- [ ] Move Blob-offloading code in dexie-cloud-addon into its own sub directory to collect this feature into a single place
- [ ] Review: `BlobRefContext`/`createBlobRefContext` in dexie-cloud-common — currently unused by server code, verify if still needed or can be removed
- [ ] Review: `TSONRef` class in dexie-cloud-common — is it still used anywhere now that TSON doesn't revive BlobRefs? If not, remove.

# Beware-ofs

- If exception happens during blob uploading phase in sync.ts, the entire flow will be forgotten even if some blobs were uploaded. Could there be a risk of eternal loop if some object causes a failure and the client keeps uploading blobs over and over with new IDs? If so, can could handle partial failures specifically? For example, to catch each operation in the loop in offloadBlobsInOperations() and if that specific situation occurs only (some succeed and then failure), update the "XXX_changes" with the BlobRef entries uploaded so far. Next sync would then continue to retry with the failed ones only. Don't know if this could be a real problem or not. Probably the common case is network failure during upload and a re-upload eternal loop might not even be a problem unless we have a bug in the code triggered by certain data.

