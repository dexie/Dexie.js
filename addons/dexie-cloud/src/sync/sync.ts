import { Table } from "dexie";
import { MINUTES } from "../helpers/date-constants";
import { getMutationTable } from "../helpers/getMutationTable";
import { getSyncableTables } from "../helpers/getSyncableTables";
import { getTableFromMutationTable } from "../helpers/getTableFromMutationTable";
import { IS_SERVICE_WORKER } from "../helpers/IS_SERVICE_WORKER";
import { DBOperationsSet } from "../types/DBOperationsSet";
import { DBOperation } from "../types/DBOperation";
import { numUnsyncedMutations } from "./numUnsyncedMutations";
import { performGuardedJob } from "./performGuardedJob";
import { SyncableDB } from '../SyncableDB';

const isSyncing = new WeakSet<SyncableDB>();
const CURRENT_SYNC_WORKER = "currentPushWorker";

export async function syncIfNeeded(db: SyncableDB) {
  if (isSyncing.has(db)) return; // Still working.
  if (!numUnsyncedMutations.get(db)) return; // undefined or 0 = nothing to sync.
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  if (typeof document !== "undefined" && document.visibilityState !== "visible")
    return;

  isSyncing.add(db);
  try {
    if (db.cloud.options.serviceWorker) {
      await sync(db);
    } else {
      // We use a flow that is better suited for the case when multiple workers want to
      // do the same thing.
      await performGuardedJob(db, CURRENT_SYNC_WORKER, "$jobs", () => sync(db));
    }
    isSyncing.delete(db);
    await syncIfNeeded(db);
  } catch (error) {
    isSyncing.delete(db);
    console.error(`Failed to sync client changes`, error);
    // I don't think we should setTimout or so here.
    // Unless server tells us to in some response.
    // Then we could follow that advice but not by waiting here but by registering
    // Something that triggers an event listened to in startPushWorker()
  }
}

export async function sync(db: SyncableDB) {
  const mutationTables = getSyncableTables(
    db.tables.map((tbl) => tbl.name)
  ).map((tbl) => db.table(getMutationTable(tbl)));

  //
  // List changes to sync
  //
  let clientChangeSet: DBOperationsSet = await db.transaction(
    "r",
    mutationTables,
    () => listClientChanges(mutationTables, db)
  );

  //
  // Push changes to server
  //
  const serverChangeSet = await syncWithServer(clientChangeSet, db);

  //
  // apply server changes
  //
  await applyServerChanges(serverChangeSet, db);

  //
  // Now when server has persisted the changes, we may delete the changes
  //
  do {
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
  } while (clientChangeSet.length > 0);
}

async function syncWithServer(
  changeSet: DBOperationsSet,
  db: SyncableDB
): Promise<DBOperationsSet> {
  //
  // Reduce changes to only contain updated fields and no duplicates
  //
  const changes = reduceChangeSet(changeSet);

  //
  // Push changes to server using fetch
  //
  const {databaseUrl} = db.cloud.options;

  
  const res = fetch(`${databaseUrl}/sync`, {})
  throw new Error(`Not implemented!`);
  const serverChanges = [] as DBOperationsSet;
  return serverChanges;
}

async function listClientChanges(
  mutationTables: Table[],
  db: SyncableDB,
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
  serverChangeSet: DBOperationsSet,
  db: SyncableDB
) {}

export function reduceChangeSet(changeSet: DBOperationsSet): DBOperationsSet {
  throw new Error(`Not implemented`);
}