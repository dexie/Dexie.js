import { Table } from '../..';
import { Collection } from './Collection.mjs';
import { Query, QueryPlan } from './Query.mjs';
import { executeQuery, executeCount } from './executeMangoQuery.mjs';

export class DexieCollection<T = any, TKey = any, TInsertType = T> extends Collection<T, TKey, TInsertType> {
  _table: Table<T, TKey, TInsertType>;
  constructor(table: Table<T, TKey, TInsertType>) {
    super(null);
    this._table = table;
  }

  protected _build(query: Query): void {
    // No additional building needed at the collection level
  }

  protected _exec(query: Query): Promise<ReadonlyArray<T> | QueryPlan> {
    // @ts-ignore
    return this._table._trans('readonly', (idbtrans) => {
      return executeQuery({
        core: this._table.core,
        trans: idbtrans as any,
        schema: this._table.core.schema,
        query,
        tableName: this._table.name,
      });
    });
  }

  protected _count(query: Query): Promise<number> {
    // @ts-ignore
    return this._table._trans('readonly', (idbtrans) => {
      return executeCount({
        core: this._table.core,
        trans: idbtrans as any,
        schema: this._table.core.schema,
        query,
        tableName: this._table.name,
      });
    });
  }
}


