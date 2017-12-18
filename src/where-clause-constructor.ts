import { Dexie } from './dexie';
import { makeClassConstructor } from './functions/make-class-constructor';
import { WhereClause } from './where-clause';
import { Table } from './table';
import { Collection } from './collection';

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
export function createWhereClauseConstructor() {
  return makeClassConstructor<WhereClauseConstructor>(
    WhereClause.prototype,

    function WhereClause(this: WhereClause, table: Table, index?: string, orCollection?: Collection) {
      this._ctx = {
        table: table,
        index: index === ":id" ? null : index,
        or: orCollection
      };
    }

  );
}
