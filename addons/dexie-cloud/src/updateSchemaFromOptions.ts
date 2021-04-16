import { DexieCloudOptions } from "./DexieCloudOptions";
import { DexieCloudSchema } from "./DexieCloudSchema";

export function updateSchemaFromOptions(schema?: DexieCloudSchema | null, options?: DexieCloudOptions | null) {
  if (schema && options) {
    if (options.unsyncedTables) {
      for (const tableName of options.unsyncedTables) {
        if (schema[tableName]) {
          schema[tableName].synced = false;
        }
      }
    }
  }
}