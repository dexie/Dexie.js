import { DexieCloudDB } from '../db/DexieCloudDB';
import Dexie from 'dexie';
import { bulkUpdate } from '../helpers/bulkUpdate';
import { DBOperationsSet } from 'dexie-cloud-common';

export async function applyServerChanges(
  changes: DBOperationsSet<string>,
  db: DexieCloudDB
) {
  console.debug('Applying server changes', changes, Dexie.currentTransaction);
  for (const { table: tableName, muts } of changes) {
    if (!db.dx._allTables[tableName]) {
      console.debug(
        `Server sent changes for table ${tableName} that we don't have. Ignoring.`
      );
      continue;
    }
    const table = db.table(tableName);
    const { primaryKey } = table.core.schema;
    const keyDecoder = (key: string) => {
      switch (key[0]) {
        case '[':
          // Decode JSON array
          if (key.endsWith(']'))
            try {
              // On server, array keys are transformed to JSON string representation
              return JSON.parse(key);
            } catch {}
          return key;
        case '#':
          // Decode private ID (do the opposite from what's done in encodeIdsForServer())
          if (key.endsWith(':' + db.cloud.currentUserId)) {
            return key.substr(
              0,
              key.length - db.cloud.currentUserId.length - 1
            );
          }
          return key;
        default:
          return key;
      }
    };
    for (const mut of muts) {
      const keys = mut.keys.map(keyDecoder);
      switch (mut.type) {
        case 'insert':
          if (primaryKey.outbound) {
            await table.bulkAdd(mut.values, keys);
          } else {
            keys.forEach((key, i) => {
              // Make sure inbound keys are consistent
              Dexie.setByKeyPath(mut.values[i], primaryKey.keyPath!, key);
            });
            await table.bulkAdd(mut.values);
          }
          break;
        case 'upsert':
          if (primaryKey.outbound) {
            await table.bulkPut(mut.values, keys);
          } else {
            keys.forEach((key, i) => {
              // Make sure inbound keys are consistent
              Dexie.setByKeyPath(mut.values[i], primaryKey.keyPath!, key);
            });
            await table.bulkPut(mut.values);
          }
          break;
        case 'modify':
          if (keys.length === 1) {
            await table.update(keys[0], mut.changeSpec);
          } else {
            await table.where(':id').anyOf(keys).modify(mut.changeSpec);
          }
          break;
        case 'update':
          await bulkUpdate(table, keys, mut.changeSpecs);
          break;
        case 'delete':
          await table.bulkDelete(keys);
          break;
      }
    }
  }
}
