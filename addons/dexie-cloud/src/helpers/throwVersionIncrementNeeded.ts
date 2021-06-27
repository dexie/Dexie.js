import Dexie from "dexie";

export function throwVersionIncrementNeeded() {
  throw new Dexie.SchemaError(
    `Version increment needed to allow dexie-cloud change tracking`
  );
}
