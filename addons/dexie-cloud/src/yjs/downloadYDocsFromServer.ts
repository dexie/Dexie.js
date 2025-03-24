import {
  asyncIterablePipeline,
  consumeChunkedBinaryStream,
  getFetchResponseBodyGenerator,
} from 'dexie-cloud-common';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { PersistedSyncState } from '../db/entities/PersistedSyncState';
import { TSON } from '../TSON';
import { loadAccessToken } from '../authentication/authenticate';
import {
  Decoder,
  readUint8,
  readVarString,
  readAny,
  readVarUint8Array,
  hasContent,
} from 'lib0/decoding';
import { getUpdatesTable } from './getUpdatesTable';
import Dexie, { InsertType, YUpdateRow } from 'dexie';

const BINSTREAM_TYPE_REALMID = 1;
const BINSTREAM_TYPE_TABLE_AND_PROP = 2;
const BINSTREAM_TYPE_DOCUMENT = 3;

export async function downloadYDocsFromServer(
  db: DexieCloudDB,
  databaseUrl: string,
  { yDownloadedRealms, realms }: PersistedSyncState
) {
  if (
    yDownloadedRealms &&
    realms &&
    realms.every((realmId) => yDownloadedRealms[realmId] === '*')
  ) {
    return; // Already done!
  }
  console.debug('Downloading Y.Docs from added realms');
  const user = await loadAccessToken(db);
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/octet-stream',
  };
  if (user) {
    headers.Authorization = `Bearer ${user.accessToken}`;
  }
  const res = await fetch(`${databaseUrl}/y/download`, {
    body: TSON.stringify({ downloadedRealms: yDownloadedRealms || {} }),
    method: 'POST',
    headers,
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(
      `Failed to download Yjs documents from server. Status: ${res.status}`
    );
  }
  await asyncIterablePipeline(
    getFetchResponseBodyGenerator(res),
    consumeChunkedBinaryStream,
    consumeDownloadChunks
  );

  async function* consumeDownloadChunks(chunks: AsyncIterable<Uint8Array>) {
    let currentRealmId: string | null = null;
    let currentTable: string | null = null;
    let currentProp: string | null = null;
    let docsToInsert: InsertType<YUpdateRow, 'i'>[] = [];

    async function storeCollectedDocs(completedRealm: boolean) {
      const lastDoc = docsToInsert[docsToInsert.length - 1];
      if (docsToInsert.length > 0) {
        if (!currentRealmId || !currentTable || !currentProp) {
          throw new Error(`Protocol error from ${databaseUrl}/y/download`);
        }
        const yTable = getUpdatesTable(db, currentTable, currentProp);
        if (yTable) {
          await yTable.bulkAdd(docsToInsert);
        }
        docsToInsert = [];
      }
      if (
        currentRealmId &&
        ((currentTable && currentProp && lastDoc) || completedRealm)
      ) {
        await db.$syncState.update('syncState', (syncState: PersistedSyncState) => {
          const yDownloadedRealms = syncState.yDownloadedRealms || {};
          yDownloadedRealms[currentRealmId!] = completedRealm
            ? '*'
            : {
                tbl: currentTable!,
                prop: currentProp!,
                key: lastDoc.k!,
              };
          syncState.yDownloadedRealms = yDownloadedRealms;
        });
      }
    }

    try {
      for await (const chunk of chunks) {
        const decoder = new Decoder(chunk);
        while (hasContent(decoder)) {
          switch (readUint8(decoder)) {
            case BINSTREAM_TYPE_REALMID:
              await storeCollectedDocs(true);
              currentRealmId = readVarString(decoder);
              break;
            case BINSTREAM_TYPE_TABLE_AND_PROP:
              await storeCollectedDocs(false); // still on same realm
              currentTable = readVarString(decoder);
              currentProp = readVarString(decoder);
              break;
            case BINSTREAM_TYPE_DOCUMENT: {
              const k = readAny(decoder);
              const u = readVarUint8Array(decoder);
              docsToInsert.push({
                k,
                u,
              });
              break;
            }
          }
        }
        await storeCollectedDocs(false); // Chunk full - migth still be on same realm
      }
      await storeCollectedDocs(true); // Everything downloaded - finalize last downloaded realm to "*"
    } catch (error) {
      if (!(error instanceof Dexie.DexieError)) {
        // Network error might have happened.
        // Store what we've collected so far:
        await storeCollectedDocs(false);
      }
      throw error;
    }
  }
}
