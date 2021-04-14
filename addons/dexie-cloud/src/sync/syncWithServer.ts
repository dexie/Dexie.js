import { DBOperationsSet } from "../types/move-to-dexie-cloud-common/DBOperationsSet";
import { DexieCloudDB } from "../db/DexieCloudDB";
import { SyncResponse } from "../types/move-to-dexie-cloud-common/SyncResponse";
import { PersistedSyncState } from "../db/entities/PersistedSyncState";
import { loadAccessToken } from "../authentication/authenticate";
import { BISON } from "../BISON";
import { DexieCloudSchema } from "../DexieCloudSchema";
import { getSyncableTables } from "../helpers/getSyncableTables";
//import {BisonWebStreamReader} from "dreambase-library/dist/typeson-simplified/BisonWebStreamReader";

export async function syncWithServer(
  changeSet: DBOperationsSet,
  syncState: PersistedSyncState | undefined,
  db: DexieCloudDB,
  databaseUrl: string,
  schema: DexieCloudSchema | null): Promise<SyncResponse> {

  //
  // Reduce changes to only contain updated fields and no duplicates
  //
  const changes = reduceChangeSet(changeSet);

  //
  // Push changes to server using fetch
  //
  const syncableTables = getSyncableTables(db);

  const headers: HeadersInit = {
    Accept: "application/x-bison, application/x-bison-stream",
    "Content-Type": "application/x-bison",
  };
  const accessToken = await loadAccessToken(db);
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${databaseUrl}/sync`, {
    headers,
    body: BISON.toBinary({
      dbID: syncState?.remoteDbId,
      schema: {
        tables: syncableTables,
      },
      lastPull: syncState && {
        serverRevision: syncState.serverRevision,
        realms: syncState.realms,
      },
      baseRevisions: syncState?.baseRevisions || [],
      changes,
    }),
  });

  switch (res.headers.get("Content-Type")) {
    case "x-bison": return BISON.fromBinary(await res.blob());
    //case "x-bison-stream": return BisonWebStreamReader(BISON, res);
  }
  throw new Error(`Unsupported content type from server`);
}

export function reduceChangeSet(changeSet: DBOperationsSet): DBOperationsSet {
  return changeSet; // TODO: Implement:
  // 1. Go through tables
  // 2. Go through mutations
  // 3. Convert to DBKeyMutation using applyOperation() until a modify operation happens.
  // 4. When modify operation happen, convert existing changes back to DBOperationSet from DBKeyMutationSet
  //    Send that DBOperation. Then send the modify operation. This procedure to be done per table ( or per set of involved tables in the transaction )
}

