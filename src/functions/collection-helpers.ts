import { combine } from "./combine";
import { IDBObjectStore, IDBCursor } from "../public/types/indexeddb";
import { exceptions } from "../errors";
import { hasOwn, trycatcher } from "../functions/utils";
import { wrap } from "../helpers/promise";
import { eventRejectHandler } from "./event-wrappers";
import { Collection } from '../collection';

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

export function getIndexOrStore(ctx: CollectionContext, store: IDBObjectStore) {
  if (ctx.isPrimKey) return store;
  var indexSpec = ctx.table.schema.idxByName[ctx.index];
  if (!indexSpec) throw new exceptions.Schema("KeyPath " + ctx.index + " on object store " + store.name + " is not indexed");
  return store.index(indexSpec.name);
}

export function openCursor(ctx: CollectionContext, store: IDBObjectStore) {
  var idxOrStore = getIndexOrStore(ctx, store);
  return ctx.keysOnly && 'openKeyCursor' in idxOrStore ?
      idxOrStore.openKeyCursor(ctx.range || null, ctx.dir + ctx.unique as IDBCursorDirection) :
      idxOrStore.openCursor(ctx.range || null, ctx.dir + ctx.unique as IDBCursorDirection);
}

export function iter (
  ctx: CollectionContext, 
  fn: (item, cursor: IDBCursor, advance: Function)=>void, 
  resolve,
  reject,
  idbstore: IDBObjectStore)
{
  var filter = ctx.replayFilter ? combine(ctx.filter, ctx.replayFilter()) : ctx.filter;
  if (!ctx.or) {
      iterate(openCursor(ctx, idbstore), combine(ctx.algorithm, filter), fn, resolve, reject, !ctx.keysOnly && ctx.valueMapper);
  } else (()=>{
      var set = {};
      var resolved = 0;

      function resolveboth() {
          if (++resolved === 2) resolve(); // Seems like we just support or btwn max 2 expressions, but there are no limit because we do recursion.
      }

      function union(item, cursor, advance) {
          if (!filter || filter(cursor, advance, resolveboth, reject)) {
              var primaryKey = cursor.primaryKey;
              var key = '' + primaryKey;
              if (key === '[object ArrayBuffer]') key = '' + new Uint8Array(primaryKey);
              if (!hasOwn(set, key)) {
                  set[key] = true;
                  fn(item, cursor, advance);
              }
          }
      }

      ctx.or._iterate(union, resolveboth, reject, idbstore);
      iterate(openCursor(ctx, idbstore), ctx.algorithm, union, resolveboth, reject, !ctx.keysOnly && ctx.valueMapper);
  })();
}

function iterate(req, filter, fn, resolve, reject, valueMapper) {
  
  // Apply valueMapper (hook('reading') or mappped class)
  var mappedFn = valueMapper ? (x,c,a) => fn(valueMapper(x),c,a) : fn;
  // Wrap fn with PSD and microtick stuff from Promise.
  var wrappedFn = wrap(mappedFn, reject);
  
  if (!req.onerror) req.onerror = eventRejectHandler(reject);
  if (filter) {
      req.onsuccess = trycatcher(function filter_record() {
          var cursor = req.result;
          if (cursor) {
              var c = function () { cursor.continue(); };
              if (filter(cursor, function (advancer) { c = advancer; }, resolve, reject))
                  wrappedFn(cursor.value, cursor, function (advancer) { c = advancer; });
              c();
          } else {
              resolve();
          }
      }, reject);
  } else {
      req.onsuccess = trycatcher(function filter_record() {
          var cursor = req.result;
          if (cursor) {
              var c = function () { cursor.continue(); };
              wrappedFn(cursor.value, cursor, function (advancer) { c = advancer; });
              c();
          } else {
              resolve();
          }
      }, reject);
  }
}
