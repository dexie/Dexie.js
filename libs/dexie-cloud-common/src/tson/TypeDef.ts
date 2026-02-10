import { TypeDefSet } from "./TypeDefSet.js";

export interface TypeDef<T = unknown, TReplaced = unknown> {
  test?: (val: T, toStringTag: string) => boolean;
  replace: (
    val: T,
    altChannel: any,
    typeDefs: TypeDefSet
  ) => TReplaced | (TReplaced & { $t: string });
  revive: (val: any, altChannel: any, typeDefs: TypeDefSet) => T;
}
