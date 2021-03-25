import { Table } from "dexie";
import { MINUTES } from "../helpers/date-constants";
import { getMutationTable } from "../helpers/getMutationTable";
import { getSyncableTables } from "../helpers/getSyncableTables";
import { getTableFromMutationTable } from "../helpers/getTableFromMutationTable";
import { DBOperationsSet } from "../types/move-to-dexie-cloud-common/DBOperationsSet";
import { DBOperation } from "../types/move-to-dexie-cloud-common/DBOperation";
import { DexieCloudDB } from "../db/DexieCloudDB";
import { SyncResponse } from "../types/move-to-dexie-cloud-common/SyncResponse";
import { PersistedSyncState } from "../db/entities/PersistedSyncState";
import { loadAccessToken } from "../authentication/authenticate";
import { BISON } from "../BISON";

export const isSyncing = new WeakSet<DexieCloudDB>();
export const CURRENT_SYNC_WORKER = "currentSyncWorker";

/*
  TODO:
    1. Rätta flödet och gör det persistent mellan transaktioner
       -> do..while snurran efter applyServerChanges() verkar onödig.
          Bättre att applyServerChanges gör detta i samma transaktion.
    2. Sync-requestet ska autenticera sig med nuvarande användare.
       MEN:
        Vissa medskickade operationer kan vara gjorda av annan användare.
        Därför: Om några av client-changes är andra användare, så måste de användarnas
        tokens följa med som extra parameter till fetch-requestet.
        Servern skall då validera och genomföra dessa operationer baserat på alternativt token.
        Kanske kan vi skita i det flödet just nu och hindra att det uppstår istället.
        Hur? Jo, genom:
          1. Användare är ANONYMOUS
          2. Data laddas ned.
          3. Data modifieras.
          4. Användare loggar in.
          5. Sync: Några inledande requests är ANONYMOUS men autenticeras som användaren.

*/

export async function sync(db: DexieCloudDB) {
  const mutationTables = getSyncableTables(db).map((tbl) =>
    db.table(getMutationTable(tbl))
  );

  //
  // List changes to sync
  //
  const $syncState = db.table("$syncState");
  const [clientChangeSet, syncState] = await db.transaction(
    "r",
    [...mutationTables, $syncState],
    async () => {
      const clientChanges = await listClientChanges(mutationTables, db);
      const syncState = await $syncState.get("syncState");
      return [clientChanges, syncState];
    }
  );

  //
  // Push changes to server
  //
  const res = await syncWithServer(clientChangeSet, syncState, db);

  //
  // apply server changes
  //
  await applyServerChanges(res, db);

  //
  // Now when server has persisted the changes, we may delete the changes
  //
  /*do {
    const previousChangeSet = clientChangeSet;
    clientChangeSet = await db.transaction("rw", mutationTables, async () => {
      const newMutsOnTables = await listClientChanges(mutationTables, db, {
        since: previousChangeSet,
      });

      // Clear out the mutations we've already sent to server.
      // Not the ones that has happened while we were syncing
      await Promise.all(
        newMutsOnTables.map(async ({ table, muts: newMuts }) => {
          if (newMuts.length > 0) {
            await db.table(table).where("rev").below(newMuts[0].rev).delete();
          } else {
            await db.table(table).clear();
          }
        })
      );
      return newMutsOnTables;
    });
  } while (clientChangeSet.length > 0);*/
}

async function syncWithServer(
  changeSet: DBOperationsSet,
  syncState: PersistedSyncState | undefined,
  db: DexieCloudDB
): Promise<SyncResponse> {
  //
  // Reduce changes to only contain updated fields and no duplicates
  //
  const changes = reduceChangeSet(changeSet);

  //
  // Push changes to server using fetch
  //
  const {
    options: { databaseUrl },
    schema,
  } = db.cloud;
  const syncableTables = db.tables
    .map((t) => t.name)
    .filter((tableName) => !/^\$/.test(tableName));

  const headers: HeadersInit = {
    Accept: "application/x-bison",
    "Content-Type": "application/x-bison",
  };
  const accessToken = await loadAccessToken(db);
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${databaseUrl}/sync`, {
    headers,
    body: BISON.toBinary({
      schema: {
        tables: syncableTables,
      },
      lastPull: syncState && {
        serverRevision: syncState.serverRevision,
        realms: syncState.realms,
      },
      changes,
    }),
  });
  throw new Error(`Not implemented!`);
  const serverChanges = [] as DBOperationsSet;
  return serverChanges;
}

async function listClientChanges(
  mutationTables: Table[],
  db: DexieCloudDB,
  { since = [] as DBOperationsSet } = {}
): Promise<DBOperationsSet> {
  const lastRevisions = new Map<string, number>();
  for (const { table, muts } of since) {
    const lastRev = muts.length > 0 ? muts[muts.length - 1].rev! : 0;
    lastRevisions.set(table, lastRev);
  }
  const allMutsOnTables = await Promise.all(
    mutationTables.map(async (mutationTable) => {
      const lastRevision = lastRevisions.get(mutationTable.name);

      const muts: DBOperation[] = lastRevision
        ? await mutationTable.where("rev").above(lastRevision).toArray()
        : await mutationTable.toArray();

      const objTable = db.table(getTableFromMutationTable(mutationTable.name));
      for (const mut of muts) {
        if (mut.type === "insert" || mut.type === "upsert") {
          mut.values = await objTable.bulkGet(mut.keys);
        }
      }
      return {
        table: mutationTable.name,
        muts,
      };
    })
  );

  // Filter out those tables that doesn't have any mutations:
  return allMutsOnTables.filter(({ muts }) => muts.length > 0);
}

export async function applyServerChanges(
  syncResponse: SyncResponse,
  db: DexieCloudDB
) {}

export function reduceChangeSet(changeSet: DBOperationsSet): DBOperationsSet {
  throw new Error(`Not implemented`);
}
