import { WhereClause as IWhereClause} from "../interfaces/where-clause";
import { Collection } from "./collection";
import { Table } from "./table";
import { IDBValidKey } from "../../api/indexeddb";

export interface WhereClauseContext {
  table: Table;
  index: string;
  or: Collection;
}

export class WhereClause implements IWhereClause {
  _ctx: WhereClauseContext;

  above(key: IDBValidKey): Collection {
    
  }
  aboveOrEqual(key: IDBValidKey): Collection {
    throw new Error("Method not implemented.");
  }
  anyOf(keys: ReadonlyArray<IDBValidKey>): Collection;
  anyOf(...keys: (IDBValidKey)[]): Collection;
  anyOf(keys?: any, ...rest?: any[]) {
    throw new Error("Method not implemented.");
  }
  anyOfIgnoreCase(keys: string[]): Collection;
  anyOfIgnoreCase(...keys: string[]): Collection;
  anyOfIgnoreCase(keys?: any, ...rest?: any[]) {
    throw new Error("Method not implemented.");
  }
  below(key: IDBValidKey): Collection {
    throw new Error("Method not implemented.");
  }
  belowOrEqual(key: IDBValidKey): Collection {
    throw new Error("Method not implemented.");
  }
  between(lower: IDBValidKey, upper: IDBValidKey, includeLower?: boolean, includeUpper?: boolean): Collection {
    throw new Error("Method not implemented.");
  }
  equals(key: IDBValidKey): Collection {
    throw new Error("Method not implemented.");
  }
  equalsIgnoreCase(key: string): Collection {
    throw new Error("Method not implemented.");
  }
  inAnyRange(ranges: ReadonlyArray<IDBValidKey>[]): Collection {
    throw new Error("Method not implemented.");
  }
  startsWith(key: string): Collection {
    throw new Error("Method not implemented.");
  }
  startsWithAnyOf(prefixes: string[]): Collection;
  startsWithAnyOf(...prefixes: string[]): Collection;
  startsWithAnyOf(prefixes?: any, ...rest?: any[]) {
    throw new Error("Method not implemented.");
  }
  startsWithIgnoreCase(key: string): Collection {
    throw new Error("Method not implemented.");
  }
  startsWithAnyOfIgnoreCase(prefixes: string[]): Collection;
  startsWithAnyOfIgnoreCase(...prefixes: string[]): Collection;
  startsWithAnyOfIgnoreCase(prefixes?: any, ...rest?: any[]) {
    throw new Error("Method not implemented.");
  }
  noneOf(keys: (IDBValidKey)[]): Collection {
    throw new Error("Method not implemented.");
  }
  notEqual(key: IDBValidKey): Collection {
    throw new Error("Method not implemented.");
  }
  
}