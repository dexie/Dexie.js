import { Table } from '../..';
import { Collection } from './Collection.mjs';
import { Query } from './Query.mjs';
import { executeQuery, executeCount } from './executeMangoQuery.mjs';

export class DexieCollection extends Collection {
  _table: Table;
  constructor(table: Table) {
    super(null);
    this._table = table;
  }

  protected _build(query: Query): void {
    // No additional building needed at the collection level
  }

  protected _exec(query: Query): Promise<ReadonlyArray<any>> {
    // @ts-ignore
    return this._table._trans('readonly', (idbtrans) => {
      return executeQuery({
        core: this._table.core,
        trans: idbtrans as any,
        schema: this._table.core.schema,
        query,
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
      });
    });
  }
}


