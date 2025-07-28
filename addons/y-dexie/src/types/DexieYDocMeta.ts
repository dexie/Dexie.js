import type { Dexie } from "dexie";

export interface DexieYDocMeta {
  db: Dexie;
  parentTable: string;
  parentId: any;
  parentProp: string;
  updatesTable: string;
}
