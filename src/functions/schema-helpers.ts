import { Dexie } from '../dexie';
import { DbSchema } from '../public/types/db-schema';
import { setProp } from './utils';
import { Transaction } from '../transaction';
import { Version } from '../version';

export function setApiOnPlace(db: Dexie, objs: Object[], tableNames: string[], dbschema: DbSchema) {
  tableNames.forEach(tableName => {
    const schema = dbschema[tableName];
    objs.forEach(obj => {
      if (!(tableName in obj)) {
        if (obj === db.Transaction.prototype || obj instanceof db.Transaction) {
          // obj is a Transaction prototype (or prototype of a subclass to Transaction)
          // Make the API a getter that returns this.table(tableName)
          setProp(obj, tableName, { get(this: Transaction) { return this.table(tableName); } });
        } else {
          // Table will not be bound to a transaction (will use Dexie.currentTransaction)
          obj[tableName] = new db.Table(tableName, schema);
        }
      }
    });
  });
}

export function removeTablesApi(db: Dexie, objs: Object[]) {
  objs.forEach(obj => {
    for (let key in obj) {
      if (obj[key] instanceof db.Table) delete obj[key];
    }
  });
}

export function lowerVersionFirst(a: Version, b: Version) {
  return a._cfg.version - b._cfg.version;
}
