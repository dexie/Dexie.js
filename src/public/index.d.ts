// Type definitions for Dexie v{version}
// Project: https://github.com/dfahlander/Dexie.js
// Definitions by: David Fahlander <http://github.com/dfahlander>

export * from './types/collection';
export * from './types/database';
export * from './types/db-events';
export * from './types/db-schema';
export * from './types/dexie-constructor';
export * from './types/dexie-dom-dependencies';
export * from './types/dexie-event-set';
export * from './types/dexie-event';
export * from './types/dexie';
export * from './types/errors';
export * from './types/index-spec';
export * from './types/indexable-type';
export * from './types/promise-extended';
export * from './types/table-hooks';
export * from './types/table-schema';
export * from './types/table';
export * from './types/then-shortcut';
export * from './types/transaction-events';
export * from './types/transaction-mode';
export * from './types/transaction';
export * from './types/version';
export * from './types/where-clause';

import { DexieConstructor} from './types/dexie-constructor';
import { PromiseExtended } from './types/promise-extended';
import { Version as IVersion} from './types/version';
import { Transaction as ITransaction} from './types/transaction';
import { Table as ITable} from './types/table';
import { IndexableType } from './types/indexable-type';
import { WhereClause as IWhereClause} from './types/where-clause';
import { Collection as ICollection} from './types/collection';

// For backard compatibility:
export declare namespace Dexie {
  type Promise<T> = PromiseExtended<T> // Because many samples have been Dexie.Promise.
  interface Version extends IVersion {} // Because addons may want to extend Dexie.Version for old dexies as well.
  interface Transaction  extends ITransaction {} // Because app code may declare it.
  interface Table<T,TKey extends IndexableType> extends ITable<T,TKey> {} // Because all samples have been Dexie.Table<...>
  interface WhereClause<T,TKey extends IndexableType> extends IWhereClause<T, TKey> {}
  interface Collection<T,TKey extends IndexableType> extends ICollection<T, TKey> {} // Because app-code may declare it.
}

declare var Dexie: DexieConstructor;

export default Dexie;
