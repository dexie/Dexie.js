import { Dexie } from '../dexie';
import { makeClassConstructor } from '../../functions/make-class-constructor';
import { WhereClause } from './where-clause';
import { Table } from '../table';
import { Collection } from '../collection';
import { exceptions } from '../../errors';
import { cmp } from '../../functions/cmp';

export interface WhereClauseConstructor {
  new(table: Table, index?: string, orCollection?: Collection): WhereClause;
  prototype: WhereClause;
}

/** Generates a WhereClause constructor.
 * 
 * The purpose of having dynamically created constructors, is to allow
 * addons to extend classes for a certain Dexie instance without affecting
 * other db instances.
 */
export function createWhereClauseConstructor(db: Dexie) {
  return makeClassConstructor<WhereClauseConstructor>(
    WhereClause.prototype,

    function WhereClause(this: WhereClause, table: Table, index?: string, orCollection?: Collection) {
      this.db = db;
      this._ctx = {
        table: table,
        index: index === ":id" ? null : index,
        or: orCollection
      };
      this._cmp = this._ascending = cmp;
      this._descending = (a, b) => cmp(b, a);
      this._max = (a, b) => cmp(a,b) > 0 ? a : b;
      this._min = (a, b) => cmp(a,b) < 0 ? a : b;
      this._IDBKeyRange = db._deps.IDBKeyRange;
      if (!this._IDBKeyRange) throw new exceptions.MissingAPI();
    }
  );
}
