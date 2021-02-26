import Dexie, { liveQuery } from "dexie";
import { getMutationTable } from "../helpers/getMutationTable";
import { getSyncableTables } from "../helpers/getSyncableTables";
import { combineLatest, from } from "rxjs";
import { filter, map } from "rxjs/operators";

export const numUnsyncedMutations = new WeakMap<Dexie, number>();

export function getNumUnsyncedMutationsObservable(db: Dexie) {
  const syncableTables = getSyncableTables(db.tables.map((t) => t.name));
  const mutationTables = syncableTables.map((table) =>
    db.table(getMutationTable(table))
  );
  const queries = mutationTables.map((mt) => from(liveQuery(() => mt.count())));
  return combineLatest(queries).pipe(
    map((counts) => counts.reduce((x, y) => x + y)),
    filter((num) => num !== numUnsyncedMutations.get(db)), // Ignore when the number is equal to what it was already
    map((num) => (numUnsyncedMutations.set(db, num), num)) // Update the global var representing current value
  );
}
