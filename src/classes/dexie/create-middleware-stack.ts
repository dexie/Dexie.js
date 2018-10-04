import { Dexie } from '.';
import { createDBCore } from '../../dbcore/dbcore-indexeddb';
import { DBCore } from '../../public/types/dbcore';
import { DexieDOMDependencies } from '../../public/types/dexie-dom-dependencies';

export function createMiddlewareStack(middlewares: {middleware: (down: DBCore) => Partial<DBCore>}[], idbdb: IDBDatabase, {IDBKeyRange, indexedDB}: DexieDOMDependencies, tmpTrans: IDBTransaction): DBCore {
  return middlewares.reduce(
    (down, {middleware}) => ({...down, ...middleware(down)}),
    createDBCore(idbdb, indexedDB, IDBKeyRange, tmpTrans));
}
