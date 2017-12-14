import { Dexie } from './dexie';
import { TableSchema } from '../../types/table-schema';
import { Transaction } from './transaction';
import { hookCreatingChain, pureFunctionChain, nop, mirror, hookUpdatingChain, hookDeletingChain } from '../chaining-functions';
import { TableHooks } from '../../types/table-hooks';
import { Table } from './table';
import Events from '../Events';
import { makeClassConstructor } from '../functions/make-class-constructor';

export interface TableConstructor {
  new (name: string, tableSchema: TableSchema, optionalTrans?: Transaction) : Table;
  prototype: Table;
}

export function createTableConstructor (db: Dexie) {
  return makeClassConstructor<TableConstructor>(
    Table.prototype,

    function Table (this: Table, name: string, tableSchema: TableSchema, trans?: Transaction) {
      this.db = db;
      this._tx = trans;
      this.name = name;
      this.schema = tableSchema;
      this.hook = db._allTables[name] ? db._allTables[name].hook : Events(null, {
        "creating": [hookCreatingChain, nop],
        "reading": [pureFunctionChain, mirror],
        "updating": [hookUpdatingChain, nop],
        "deleting": [hookDeletingChain, nop]
      }) as TableHooks;
    }

  );
}
