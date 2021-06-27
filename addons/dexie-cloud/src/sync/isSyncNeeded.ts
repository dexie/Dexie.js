import { DexieCloudDB } from "../db/DexieCloudDB";
import { sync } from "./sync";

export async function isSyncNeeded(db: DexieCloudDB) {
  return db.cloud.options?.databaseUrl && db.cloud.schema
    ? await sync(db, db.cloud.options, db.cloud.schema, {justCheckIfNeeded: true})
    : false;
}
