import { DBCore, KeyRange, DBCoreSchema, DBCoreTableSchema, DBCoreIndex, Key, DBCoreTable } from "./dbcore";

export interface VirtualIndex extends DBCoreIndex {
  /** True if this index is virtual, i.e. represents a compound index internally,
   * but makes it act as as having a subset of its keyPaths.
   */
  isVirtual: boolean;
  /** Identical to keyPaths.length. Can be 0..N. Note: This is the length of the *virtual index*, not
   * the real index.
   */
  keyLength: number;

  /** If this is a virtual index representing all but some keys in a compound index,
   * the keyTail is a number of skipped keys from the real index.
   */
  keyTail?: number;

  /** 0..N keyPaths that really represents the property that this index refers to.
   * For outbound primary keys, this is null.
   * For normal indexes, this is same as index.keyPath.
   * For virtually normal indexes (but compound internally), this will still be the single keyPath.
  */
  keyPathArray: string[];

  /** A string representation of keyPaths. Used to map a string represented keyPath to an index.
   * If no keyPath, keyPathAlias = ":id"
   * If one keyPath, keyPathAlias = keyPaths[0]
   * If several keyPaths, keyPathAlias = '[' + keyPaths.join('+') + ']'.
   */
  keyPathAlias: string;

  /** Extract (using keyPath) a key from given value (object)
   * 
  */
  extractKey: (value: any) => Key;
}

export interface KeyPathQuery {
  keyPath: string;
  range: KeyRange;
}

export interface VirtualTableSchema extends DBCoreTableSchema {
  primaryKey: VirtualIndex;
  indexes: VirtualIndex[];
  getIndex(keyPaths: string | string[]): VirtualIndex;
}

export interface DBCoreUp1Table<TQuery=KeyPathQuery> extends DBCoreTable<TQuery> {
  schema: VirtualTableSchema;
}

export interface DBCoreUp1<TQuery=KeyPathQuery> extends DBCore<TQuery> {
  table(name: string): DBCoreUp1Table<TQuery>;
}

