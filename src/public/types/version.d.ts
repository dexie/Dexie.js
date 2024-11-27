import { Transaction } from "./transaction";
import { LooseStoresSpec, StoresSpec } from "./strictly-typed-schema";

export interface Version {
  stores(schema: LooseStoresSpec): Version;
  upgrade(fn: (trans: Transaction) => PromiseLike<any> | void): Version;
}
