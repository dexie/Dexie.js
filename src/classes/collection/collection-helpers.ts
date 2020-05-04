import { combine } from "../../functions/combine";
import { exceptions } from "../../errors";
import { hasOwn } from "../../functions/utils";
import { wrap } from "../../helpers/promise";
import { Collection } from './';
import { DBCoreCursor, DBCoreTable, DBCoreTransaction, DBCoreTableSchema, DBCoreRangeType } from '../../public/types/dbcore';
import { nop } from '../../functions/chaining-functions';

type CollectionContext = Collection["_ctx"];

export function isPlainKeyRange (ctx: CollectionContext, ignoreLimitFilter?: boolean) {
  return !(ctx.filter || ctx.algorithm || ctx.or) &&
      (ignoreLimitFilter ? ctx.justLimit : !ctx.replayFilter);
}    

export function addFilter(ctx: CollectionContext, fn: Function) {
  ctx.filter = combine(ctx.filter, fn);
}

export function addReplayFilter (ctx: CollectionContext, factory, isLimitFilter?) {
  var curr = ctx.replayFilter;
  ctx.replayFilter = curr ? ()=>combine(curr(), factory()) : factory;
  ctx.justLimit = isLimitFilter && !curr;
}

export function addMatchFilter(ctx: CollectionContext, fn) {
  ctx.isMatch = combine(ctx.isMatch, fn);
}

export function getIndexOrStore(ctx: CollectionContext, coreSchema: DBCoreTableSchema) {
  // TODO: Rewrite this. No need to know ctx.isPrimKey. ctx.index should hold the keypath.
  // Still, throw if not found!
  if (ctx.isPrimKey) return coreSchema.primaryKey;
  const index = coreSchema.getIndexByKeyPath(ctx.index);
  if (!index) throw new exceptions.Schema("KeyPath " + ctx.index + " on object store " + coreSchema.name + " is not indexed");
  return index;
}

export function openCursor(ctx: CollectionContext, coreTable: DBCoreTable, trans: DBCoreTransaction) {
  const index = getIndexOrStore(ctx, coreTable.schema);
  return coreTable.openCursor({
    trans,
    values: !ctx.keysOnly,
    reverse: ctx.dir === 'prev',
    unique: !!ctx.unique,
    query: {
      index, 
      range: ctx.range
    }
  });
}

export function iter (
  ctx: CollectionContext, 
  fn: (item, cursor: DBCoreCursor, advance: Function)=>void,
  coreTrans: DBCoreTransaction,
  coreTable: DBCoreTable): Promise<any>
{
  const filter = ctx.replayFilter ? combine(ctx.filter, ctx.replayFilter()) : ctx.filter;
  if (!ctx.or) {
      return iterate(
        openCursor(ctx, coreTable, coreTrans),
        combine(ctx.algorithm, filter), fn, !ctx.keysOnly && ctx.valueMapper);
  } else {
      const set = {};

      const union = (item: any, cursor: DBCoreCursor, advance) => {
          if (!filter || filter(cursor, advance, result=>cursor.stop(result), err => cursor.fail(err))) {
              var primaryKey = cursor.primaryKey;
              var key = '' + primaryKey;
              if (key === '[object ArrayBuffer]') key = '' + new Uint8Array(primaryKey);
              if (!hasOwn(set, key)) {
                  set[key] = true;
                  fn(item, cursor, advance);
              }
          }
      }

      return Promise.all([
        ctx.or._iterate(union, coreTrans),
        iterate(openCursor(ctx, coreTable, coreTrans), ctx.algorithm, union, !ctx.keysOnly && ctx.valueMapper)
      ]);
  }
}

function iterate(cursorPromise: Promise<DBCoreCursor>, filter, fn, valueMapper): Promise<any> {
  
  // Apply valueMapper (hook('reading') or mappped class)
  var mappedFn = valueMapper ? (x,c,a) => fn(valueMapper(x),c,a) : fn;
  // Wrap fn with PSD and microtick stuff from Promise.
  var wrappedFn = wrap(mappedFn);
  
  return cursorPromise.then(cursor => {
    if (cursor) {
      return cursor.start(()=>{
        var c = ()=>cursor.continue();
        if (!filter || filter(cursor, advancer => c = advancer, val=>{cursor.stop(val);c=nop}, e => {cursor.fail(e);c = nop;}))
          wrappedFn(cursor.value, cursor, advancer => c = advancer);
        c();
      });
    }
  });
}
