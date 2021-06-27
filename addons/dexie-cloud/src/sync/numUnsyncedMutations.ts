import Dexie, { liveQuery } from "dexie";
import { getMutationTable } from "../helpers/getMutationTable";
import { getSyncableTables } from "../helpers/getSyncableTables";
import { combineLatest, forkJoin, from } from "rxjs";
import { distinctUntilChanged, filter, map } from "rxjs/operators";
import { DexieCloudDB } from "../db/DexieCloudDB";

export function getNumUnsyncedMutationsObservable(db: DexieCloudDB) {
  const syncableTables = getSyncableTables(db);
  const mutationTables = syncableTables.map((table) =>
    db.table(getMutationTable(table.name))
  );
  const queries = mutationTables.map((mt) => from(liveQuery(() => mt.count())));
  return forkJoin(queries).pipe(
    // Compute the sum of all tables' unsynced changes:
    map((counts) => counts.reduce((x, y) => x + y)),
    // Swallow false positives - when the number was the same as before:
    distinctUntilChanged()
  );
}
