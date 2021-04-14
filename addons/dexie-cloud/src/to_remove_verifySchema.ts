import Dexie, { Table } from "dexie";
import { DexieCloudDB } from "./db/DexieCloudDB";
import { UserLogin } from "./db/entities/UserLogin";
import { randomString } from "./helpers/randomString";
import { throwVersionIncrementNeeded } from "./helpers/throwVersionIncrementNeeded";
import { DBOperation } from "./types/move-to-dexie-cloud-common/DBOperation";

export function verifySchema(db: DexieCloudDB) {
  return db.transaction('rw', db.tables, async () => {
    // TODO:
    // 1. Om tabell gått från icke-sync till sync, skapa upp realmId, owner och dess operations.
    //    Denna åtgärd skall även göras när en DB går från plain Dexie till dexieCloud enabled (men
    //    det blir ju automatiskt här) men också när en användare blir inloggad.
    // 2. Om en tabell gått från sync till icke sync, ta bort dess operations? Eller? Behövs det?
    //    Vad händer om den går som synk igen? Överskrivning bara. Helt ok?!

    // OCKSÅ!
    //    * Ska vi ha ett syncFilter (per object sync). Om så, mutationTrackingMiddleware måste hantera ändringar av syncFilter
    //      och försätta objektet i synkat läge eller inte.
    //      Om så, vad händer om filtret ändras?
    //        Hitta objekt som förut inte synkades men nu gör det och adda?
    //        Hitta objekt som förut synkades men nu inte gör det och deleta från server?
    //    * Ska vi ha ett property filter? Så man kan sätta properties som inte åker upp? Njae. Kanske i framtid. Workaround är en kompletterande tabell som inte synkas.

    const [user, schema, syncState] = await Promise.all([
      db.getCurrentUser(),
      db.getSchema(),
      db.getPersistedSyncState()]);
    
    if (!schema) {
      // Add the schema as it has been configured.
      // If dynamically opening DB, schema is empty. That's ok.
      // It only contains the extension prop "generatedGlobalId".
      await db.$syncState.add({
        tables: db.cloud.schema,
      }, "schema");
      // Initial schema creation.
    } else if (JSON.stringify(schema) !== JSON.stringify(db.cloud.schema)) {
      // Update it
      schema.tables = db.cloud.schema;
      await db.$syncState.put(schema, "schema");
    }
  });
}

export async function convertNonSyncTableToSync(table: Table, mutations: Table<DBOperation>, user: UserLogin) {
  // Future: Do all this in a streaming fashion:
  const allObjs = await table.toArray();
  for (const obj of allObjs) {
    obj.realmId = user.userId;
    obj.owner = user.userId;
  }
  await table.bulkPut(allObjs);
  await mutations.add({
    type: "insert",
    keys: allObjs.map(obj => table.core.schema.primaryKey.extractKey),
    txid: randomString(16),
    userId: user.userId,
    values: allObjs
  });
}