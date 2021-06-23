import { DexieCloudSchema } from "dexie-cloud-common";
import { DexieCloudOptions } from "./DexieCloudOptions";

export function updateSchemaFromOptions(schema?: DexieCloudSchema | null, options?: DexieCloudOptions | null) {
  if (schema && options) {
    if (options.unsyncedTables) {
      for (const tableName of options.unsyncedTables) {
        if (schema[tableName]) {
          schema[tableName].markedForSync = false;
        }
      }
    }
  }
}