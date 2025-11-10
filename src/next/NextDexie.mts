import { Dexie, PromiseExtended } from '../../dist/dexie';
import { DexieCollection } from './DexieCollection.mjs';

type TableProps<D extends Dexie> = {
  [P in keyof D]: D[P] extends {get(key: any): PromiseExtended<any>, toArray: () => PromiseExtended<any[]>} ? P : never;
}[keyof D];


export type NextDexie<D extends Dexie> = {
  [P in TableProps<D>]: D[P] extends {
    get(key: infer K): PromiseExtended<any>;
    toArray: () => PromiseExtended<Array<infer T>>;
  }
    ? DexieCollection<T, K>
    : D[P];
} & {
  readonly name: string;
  readonly tables: DexieCollection<any, any>[];
}

const wm = new WeakMap<Dexie, NextDexie<Dexie>>();

export function NextDexie<D extends Dexie>(db: D): NextDexie<D> {
  let nextDexie = wm.get(db);
  if (nextDexie) return nextDexie as NextDexie<D>;
  nextDexie = {
    name: db.name,
    tables: [] as DexieCollection<any, any>[],
  } as NextDexie<D>;
  for (const table of db.tables) {
    nextDexie.tables.push(new DexieCollection(table));
  }
  wm.set(db, nextDexie);
  return nextDexie as NextDexie<D>;
}

