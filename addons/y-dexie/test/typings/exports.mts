// Resolve the built package entry point, not src/ or a paths alias.
import yDexie, {
  DexieYProvider,
  compressYDocs,
  type DexieYDocMeta,
  type YDocCache,
  type YLastCompressed,
  type YSyncState,
  type YUpdateRow,
  type YDexieOptions,
} from 'y-dexie';
import { Dexie, type IndexableType } from 'dexie';
import * as Y from 'yjs';

declare const db: Dexie;
declare const doc: Y.Doc;
declare const meta: DexieYDocMeta;
declare const cache: YDocCache;
declare const lastCompressed: YLastCompressed;
declare const syncState: YSyncState;
declare const update: YUpdateRow;

const options: YDexieOptions = { gc: false };
yDexie(db);
yDexie(options);
const provider: DexieYProvider = DexieYProvider.load(doc);
const loaded: Promise<void> = provider.whenLoaded;
const compression: Promise<unknown> = compressYDocs(db);
const parentDB: Dexie = meta.db;
const cachedDoc: Y.Doc | undefined = cache.find('docs', 1, 'content');
const stamp: 0 = lastCompressed.i;
const engine: string = syncState.i;
const key: IndexableType = update.k;

type IsAny<T> = 0 extends 1 & T ? true : false;
type AssertFalse<T extends false> = T;
type PublicTypesAreNotAny = [
  AssertFalse<IsAny<typeof yDexie>>,
  AssertFalse<IsAny<typeof DexieYProvider>>,
  AssertFalse<IsAny<DexieYProvider>>,
  AssertFalse<IsAny<DexieYProvider['doc']>>,
  AssertFalse<IsAny<ReturnType<typeof DexieYProvider.getDocCache>>>,
  AssertFalse<IsAny<typeof DexieYProvider.currentUpdateRow>>,
  AssertFalse<IsAny<ReturnType<typeof compressYDocs>>>,
  AssertFalse<IsAny<DexieYDocMeta>>,
  AssertFalse<IsAny<YDocCache>>,
  AssertFalse<IsAny<YLastCompressed>>,
  AssertFalse<IsAny<YSyncState>>,
  AssertFalse<IsAny<YUpdateRow>>,
];

// These must be errors even with skipLibCheck: true. Unresolved re-exports
// otherwise silently degrade the public values to any (issue #2366).
// @ts-expect-error A provider class is not a symbol.
const providerSymbol: symbol = DexieYProvider;
// @ts-expect-error A compression function is not a symbol.
const compressionSymbol: symbol = compressYDocs;
// @ts-expect-error Cache results are documents, not strings.
const cachedString: string = cache.find('docs', 1, 'content');
// @ts-expect-error Provider methods must retain their argument types.
DexieYProvider.load('not a Y.Doc');
