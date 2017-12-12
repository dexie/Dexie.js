import { WhereClause } from "../interfaces/where-clause";
import { CollectionImpl } from "./collection-impl";
import { TableImpl } from "./table-impl";
import { IndexableType } from "../types/indexable-type";
import Promise from "../interfaces/promise-extended";

export interface WhereClauseContext<T,TKey extends IndexableType> {
  table: TableImpl<T,TKey>;
  index: string;
  or: CollectionImpl<T,TKey>;
}

export class WhereClauseImpl<T,TKey extends IndexableType> implements WhereClause<T,TKey> {
  _ctx: WhereClauseContext<T,TKey>;

  constructor(table: TableImpl<T,TKey>, index?: string, orCollection?: CollectionImpl<T,TKey>) {
    
  }

  above(key: IndexableType): CollectionImpl<T, TKey> {
    
  }
  aboveOrEqual(key: IndexableType): CollectionImpl<T, TKey> {
    throw new Error("Method not implemented.");
  }
  anyOf(keys: ReadonlyArray<IndexableType>): CollectionImpl<T, TKey>;
  anyOf(...keys: (IndexableType)[]): CollectionImpl<T, TKey>;
  anyOf(keys?: any, ...rest?: any[]) {
    throw new Error("Method not implemented.");
  }
  anyOfIgnoreCase(keys: string[]): CollectionImpl<T, TKey>;
  anyOfIgnoreCase(...keys: string[]): CollectionImpl<T, TKey>;
  anyOfIgnoreCase(keys?: any, ...rest?: any[]) {
    throw new Error("Method not implemented.");
  }
  below(key: IndexableType): CollectionImpl<T, TKey> {
    throw new Error("Method not implemented.");
  }
  belowOrEqual(key: IndexableType): CollectionImpl<T, TKey> {
    throw new Error("Method not implemented.");
  }
  between(lower: IndexableType, upper: IndexableType, includeLower?: boolean, includeUpper?: boolean): CollectionImpl<T, TKey> {
    throw new Error("Method not implemented.");
  }
  equals(key: IndexableType): CollectionImpl<T, TKey> {
    throw new Error("Method not implemented.");
  }
  equalsIgnoreCase(key: string): CollectionImpl<T, TKey> {
    throw new Error("Method not implemented.");
  }
  inAnyRange(ranges: ReadonlyArray<IndexableType>[]): CollectionImpl<T, TKey> {
    throw new Error("Method not implemented.");
  }
  startsWith(key: string): CollectionImpl<T, TKey> {
    throw new Error("Method not implemented.");
  }
  startsWithAnyOf(prefixes: string[]): CollectionImpl<T, TKey>;
  startsWithAnyOf(...prefixes: string[]): CollectionImpl<T, TKey>;
  startsWithAnyOf(prefixes?: any, ...rest?: any[]) {
    throw new Error("Method not implemented.");
  }
  startsWithIgnoreCase(key: string): CollectionImpl<T, TKey> {
    throw new Error("Method not implemented.");
  }
  startsWithAnyOfIgnoreCase(prefixes: string[]): CollectionImpl<T, TKey>;
  startsWithAnyOfIgnoreCase(...prefixes: string[]): CollectionImpl<T, TKey>;
  startsWithAnyOfIgnoreCase(prefixes?: any, ...rest?: any[]) {
    throw new Error("Method not implemented.");
  }
  noneOf(keys: (IndexableType)[]): CollectionImpl<T, TKey> {
    throw new Error("Method not implemented.");
  }
  notEqual(key: IndexableType): CollectionImpl<T, TKey> {
    throw new Error("Method not implemented.");
  }
  
}