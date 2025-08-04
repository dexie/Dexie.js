import { DbSchema } from "./db-schema";
import { Dexie } from "./dexie";
import { IndexSpec } from "./index-spec";
import { TableSchema } from "./table-schema";
import { Transaction } from "./transaction";

export interface Version {
  stores(schema: { [tableName: string]: string | null }): Version;
  upgrade(fn: (trans: Transaction) => PromiseLike<any> | void): Version;
}

export interface ExtendableVersion extends Version {
  db: Dexie;
  _parseStoresSpec(
    stores: { [tableName: string]: string | null },
    outSchema: DbSchema
  ): void;
  _createTableSchema(
    tableName: string,
    primKey: IndexSpec,
    indexes: IndexSpec[],
  ): TableSchema;
  _parseIndexSyntax(primKeyAndIndexes: string): IndexSpec[];
}
