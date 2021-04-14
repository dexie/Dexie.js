import { Dexie, Table } from "dexie";

class DexieCloudGlobalDB extends Dexie {
  swManagedDBs!: Table<{db: string}, string>;

  constructor() {
    super("DexieCloud", {addons: []});
    this.version(1).stores({
      swManagedDBs: 'db'
    });
  }
}

export const dexieCloudGlobalDB = new DexieCloudGlobalDB();

