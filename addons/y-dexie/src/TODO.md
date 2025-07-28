Files to go through:

- [x] Copy all files from dexie/src/yjs
- [x] YUpdateRow.ts
- [x] observeYDocUpdates.ts
- [x] periodicGC.ts
- [x] Remove getYLibrary.ts 
- [x] compressYDocs.ts
- [x] docCache.ts
- [x] getOrCreateDocument.ts
- [x] DexieYProvider.ts
- [ ] createYDocProperty.ts
- [ ] createYjsMiddleware.ts
- [ ] Move db.on.y to y-dexie
- [ ] Delete y-related and other y stuff from dexie except the schema syntax somehow
- [ ] Allow for extending schema syntax (type specification) and let y-dexie extend it (":Y.Doc" syntax)

Steps to do:

1. Fix failing imports.
2. In the addon's main, call periodicGC.ts
3. Remove some-deps.ts
4. Do other things need to be done (check where yjs code is called from in dexie 4.1)
