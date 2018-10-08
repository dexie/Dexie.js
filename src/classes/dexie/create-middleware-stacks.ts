import { Dexie } from './';
import { createDBCore } from '../../dbcore/dbcore-indexeddb';
import { DBCore } from '../../public/types/dbcore';
import { DexieDOMDependencies } from '../../public/types/dexie-dom-dependencies';
import { DexieStacks, Middleware } from '../../public/types/middleware';

function createMiddlewareStack<TStack extends {stack: string}>(
  stackImpl: {stack: string},
  middlewares: Middleware<{stack: string}>[]): TStack {
  return middlewares.reduce((down, {create}) => ({...down, ...create(down)}), stackImpl) as TStack;
} 

export function createMiddlewareStacks(
  middlewares: {[StackName in keyof DexieStacks]?: Middleware<DexieStacks[StackName]>[]},
  idbdb: IDBDatabase,
  {IDBKeyRange, indexedDB}: DexieDOMDependencies,
  tmpTrans: IDBTransaction): {[StackName in keyof DexieStacks]?: DexieStacks[StackName]}
{
  const dbcore = createMiddlewareStack<DBCore>(
    createDBCore(idbdb, indexedDB, IDBKeyRange, tmpTrans),
    middlewares.dbcore);
  
  // TODO: Create other stacks the same way as above. They might be dependant on the result
  // of creating dbcore stack.

  return {
    dbcore
  };
}
