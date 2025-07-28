Files to go through:

- [x] Copy all files from dexie/src/yjs
- [x] YUpdateRow.ts
- [x] observeYDocUpdates.ts
- [x] periodicGC.ts
- [x] Remove getYLibrary.ts 
- [x] compressYDocs.ts
- [ ] createYDocProperty.ts
- [ ] DexieYProvider.ts
- [ ] docCache.ts
- [ ] getOrCreateDocument.ts
- [ ] 

Steps to do:

1. Fix failing imports.
2. In the addon's main, call periodicGC.ts
3. Remove some-deps.ts
4. Do other things need to be done (check where yjs code is called from in dexie 4.1)
