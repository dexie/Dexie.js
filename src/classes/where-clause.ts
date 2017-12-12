import { WhereClause as IWhereClause} from "../interfaces/where-clause";
import { Collection } from "./collection";
import { Table } from "./table";
import { IndexableType } from "../types/indexable-type";
import Promise from "../interfaces/promise-extended";

export interface WhereClauseContext<T,TKey extends IndexableType> {
  table: Table<T,TKey>;
  index: string;
  or: Collection<T,TKey>;
}

export class WhereClause<T,TKey extends IndexableType> implements IWhereClause<T,TKey> {
  _ctx: WhereClauseContext<T,TKey>;

  constructor(table: Table<T,TKey>, index?: string, orCollection?: Collection<T,TKey>) {
    
  }

  above(key: IndexableType): Collection<T, TKey> {
    
  }
  aboveOrEqual(key: IndexableType): Collection<T, TKey> {
    throw new Error("Method not implemented.");
  }
  anyOf(keys: ReadonlyArray<IndexableType>): Collection<T, TKey>;
  anyOf(...keys: (IndexableType)[]): Collection<T, TKey>;
  anyOf(keys?: any, ...rest?: any[]) {
    throw new Error("Method not implemented.");
  }
  anyOfIgnoreCase(keys: string[]): Collection<T, TKey>;
  anyOfIgnoreCase(...keys: string[]): Collection<T, TKey>;
  anyOfIgnoreCase(keys?: any, ...rest?: any[]) {
    throw new Error("Method not implemented.");
  }
  below(key: IndexableType): Collection<T, TKey> {
    throw new Error("Method not implemented.");
  }
  belowOrEqual(key: IndexableType): Collection<T, TKey> {
    throw new Error("Method not implemented.");
  }
  between(lower: IndexableType, upper: IndexableType, includeLower?: boolean, includeUpper?: boolean): Collection<T, TKey> {
    throw new Error("Method not implemented.");
  }
  equals(key: IndexableType): Collection<T, TKey> {
    throw new Error("Method not implemented.");
  }
  equalsIgnoreCase(key: string): Collection<T, TKey> {
    throw new Error("Method not implemented.");
  }
  inAnyRange(ranges: ReadonlyArray<IndexableType>[]): Collection<T, TKey> {
    throw new Error("Method not implemented.");
  }
  startsWith(key: string): Collection<T, TKey> {
    throw new Error("Method not implemented.");
  }
  startsWithAnyOf(prefixes: string[]): Collection<T, TKey>;
  startsWithAnyOf(...prefixes: string[]): Collection<T, TKey>;
  startsWithAnyOf(prefixes?: any, ...rest?: any[]) {
    throw new Error("Method not implemented.");
  }
  startsWithIgnoreCase(key: string): Collection<T, TKey> {
    throw new Error("Method not implemented.");
  }
  startsWithAnyOfIgnoreCase(prefixes: string[]): Collection<T, TKey>;
  startsWithAnyOfIgnoreCase(...prefixes: string[]): Collection<T, TKey>;
  startsWithAnyOfIgnoreCase(prefixes?: any, ...rest?: any[]) {
    throw new Error("Method not implemented.");
  }
  noneOf(keys: (IndexableType)[]): Collection<T, TKey> {
    throw new Error("Method not implemented.");
  }
  notEqual(key: IndexableType): Collection<T, TKey> {
    throw new Error("Method not implemented.");
  }
  
}