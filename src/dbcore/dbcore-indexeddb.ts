import { DBCore, DBCoreCursor, DBCoreOpenCursorRequest, DBCoreQueryRequest, DBCoreCountRequest,
  DBCoreIndex, KeyRange, DBCoreQueryResponse, RangeType, DBCoreSchema, DBCoreTableSchema, DBCoreTable,
  MutateRequest, AddRequest, PutRequest, DeleteRequest, DeleteRangeRequest, MutateResponse, DBCoreTransaction }
  from '../public/types/dbcore';
import { isArray, trycatcher } from '../functions/utils';
import { eventRejectHandler, preventDefault } from '../functions/event-wrappers';
import { wrap } from '../helpers/promise';
import { getMaxKey } from '../functions/quirks';
import { getKeyExtractor } from './get-key-extractor';
import { getEffectiveKeys } from './get-effective-keys';

export function arrayify<T>(arrayLike: {length: number, [index: number]: T}): T[] {
  return [].slice.call(arrayLike);
}
export function pick<T,Prop extends keyof T>(obj: T, props: Prop[]): Pick<T, Prop> {
  const result = {} as Pick<T, Prop>;
  props.forEach(prop => result[prop] = obj[prop]);
  return result;
}

let _id_counter = 0;

export function getKeyPathAlias(keyPath: null | string | string[]) {
  return keyPath == null ?
    ":id" :
    typeof keyPath === 'string' ?
      keyPath :
      `[${keyPath.join('+')}]`;
}

export function createDBCore (
  db: IDBDatabase,
  indexedDB: IDBFactory,
  IdbKeyRange: typeof IDBKeyRange,
  tmpTrans: IDBTransaction) : DBCore
{
  const cmp = indexedDB.cmp.bind(indexedDB);
  
  function extractSchema(db: IDBDatabase, trans: IDBTransaction) : {schema: DBCoreSchema, hasGetAll: boolean} {
    const tables = arrayify(db.objectStoreNames);
    return {
      schema: {
        name: db.name,
        tables: tables.map(table => trans.objectStore(table)).map(store => {
          const {keyPath, autoIncrement} = store;
          const compound = isArray(keyPath);
          const outbound = keyPath == null;
          const indexByKeyPath: {[keyPathAlias: string]: DBCoreIndex} = {};
          const result = {
            name: store.name,
            primaryKey: {
              name: null,
              isPrimaryKey: true,
              outbound,
              compound,
              keyPath,
              autoIncrement,
              unique: true,
              extractKey: getKeyExtractor(keyPath)
            } as DBCoreIndex,
            indexes: arrayify(store.indexNames).map(indexName => store.index(indexName))
              .map(index => {
                const {name, unique, multiEntry, keyPath} = index;
                const compound = isArray(keyPath);
                const result: DBCoreIndex = {
                  name,
                  compound,
                  keyPath,
                  unique,
                  multiEntry,
                  extractKey: getKeyExtractor(keyPath)
                };
                indexByKeyPath[getKeyPathAlias(keyPath)] = result;
                return result;
              }),
            getIndexByKeyPath: (keyPath: null | string | string[]) => indexByKeyPath[getKeyPathAlias(keyPath)]
          };
          indexByKeyPath[":id"] = result.primaryKey;
          if (keyPath != null) {
            indexByKeyPath[getKeyPathAlias(keyPath)] = result.primaryKey;
          }
          return result;
        })
      },
      hasGetAll: tables.length > 0 && ('getAll' in trans.objectStore(tables[0])) &&
        !(typeof navigator !== 'undefined' && /Safari/.test(navigator.userAgent) &&
        !/(Chrome\/|Edge\/)/.test(navigator.userAgent) &&
        [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604) // Bug with getAll() on Safari ver<604. See discussion following PR #579
    };
  }

  function makeIDBKeyRange (range: KeyRange) : IDBKeyRange | null {
    if (range.type === RangeType.Any) return null;
    if (range.type === RangeType.Never) throw new Error("Cannot convert never type to IDBKeyRange");
    const {lower, upper, lowerOpen, upperOpen} = range;
    const idbRange = lower === undefined ?
      upper === undefined ?
        null : //IDBKeyRange.lowerBound(-Infinity, false) : // Any range (TODO: Should we return null instead?)
        IdbKeyRange.upperBound(upper, !!upperOpen) : // below
      upper === undefined ?
        IdbKeyRange.lowerBound(lower, !!lowerOpen) : // above
        IdbKeyRange.bound(lower, upper, !!lowerOpen, !!upperOpen);
    return idbRange;
  }

  function createDbCoreTable(tableSchema: DBCoreTableSchema): DBCoreTable {
    const tableName = tableSchema.name;

    function mutate ({trans, type, keys, values, range, wantResults}) {
      return new Promise<MutateResponse>((resolve, reject) => {
        resolve = wrap(resolve);
        const store = (trans as IDBTransaction).objectStore(tableName);
        const outbound = store.keyPath == null;
        const isAddOrPut = type === "put" || type === "add";
        if (!isAddOrPut && type !== 'delete' && type !== 'deleteRange')
          throw new Error ("Invalid operation type: " + type);

        const {length} = keys || values || {length: 1}; // keys.length if keys. values.length if values. 1 if range.
        if (keys && values && keys.length !== values.length) {
          throw new Error("Given keys array must have same length as given values array.");
        }
        if (length === 0)
          // No items to write. Don't even bother!
          return resolve({numFailures: 0, failures: {}, results: [], lastResult: undefined});

        const results = wantResults && [...(keys ?
          keys : // keys already resolved in an earlier middleware. Don't re-resolve them.
          getEffectiveKeys(tableSchema.primaryKey, {type, keys, values}))];
          
        let req: IDBRequest & { _reqno?};
        const failures: {[operationNumber: number]: Error} = [];
        let numFailures = 0;
        const errorHandler = 
          event => {
            ++numFailures;
            preventDefault(event);
            if (results) results[(event.target as any)._reqno] = undefined;
            failures[(event.target as any)._reqno] = event.target.error;
          };
        const setResult = ({target}) => {
          results[target._reqno] = target.result;
        }
  
        if (type === 'deleteRange') {
          // Here the argument is the range
          if (range.type === RangeType.Never)
            return resolve({numFailures, failures, results, lastResult: undefined}); // Deleting the Never range shoulnt do anything.
          if (range.type === RangeType.Any)
            req = store.clear(); // Deleting the Any range is equivalent to store.clear()
          else
            req = store.delete(makeIDBKeyRange(range));
        } else {
          // No matter add, put or delete - find out arrays of first and second arguments to it.
          const [args1, args2] = isAddOrPut ?
            outbound ?
              [values, keys] :
              [values, null] :
            [keys, null];

          if (isAddOrPut) {
            for (let i=0; i<length; ++i) {
              req = (args2 && args2[i] !== undefined ?
                store[type](args1[i], args2[i]) :
                store[type](args1[i])) as IDBRequest;
              req._reqno = i;
              if (results && results[i] === undefined) {
                // Key is not set explicitely and is autoIncremented.
                // Have to listen for onsuccess and set the resulting key.
                req.onsuccess = setResult;
              }
              req.onerror = errorHandler;
            }
          } else {
            for (let i=0; i<length; ++i) {
              req = store[type](args1[i]) as IDBRequest;
              req._reqno = i;
              req.onerror = errorHandler;
            }
          }
        }
        const done = event => {
          const lastResult = event.target.result;
          if (results) results[length-1] = lastResult;
          resolve({
            numFailures,
            failures,
            results,
            lastResult
          });
        };
  
        req.onerror = event => { // wrap() not needed. All paths calling outside will wrap!
          errorHandler(event);
          done(event);
        };
  
        req.onsuccess = done;
      });
    }
    
    function openCursor ({trans, values, query, reverse, unique}: DBCoreOpenCursorRequest): Promise<DBCoreCursor>
    {
      return new Promise((resolve, reject) => {
        resolve = wrap(resolve);
        const {index, range} = query;
        const store = (trans as IDBTransaction).objectStore(tableName);
        // source
        const source = index.isPrimaryKey ?
          store :
          store.index(index.name);
        // direction
        const direction = reverse ?
          unique ?
            "prevunique" :
            "prev" :
          unique ?
            "nextunique" :
            "next";
        // request
        const req = values || !('openKeyCursor' in source) ?
          source.openCursor(makeIDBKeyRange(range), direction) :
          source.openKeyCursor(makeIDBKeyRange(range), direction);
          
        // iteration
        req.onerror = eventRejectHandler(reject);
        req.onsuccess = wrap(ev => {

          const cursor = req.result as unknown as DBCoreCursor;
          if (!cursor) {
            resolve(null);
            return;
          }
          (cursor as any).___id = ++_id_counter;
          (cursor as any).done = false;
          const _cursorContinue = cursor.continue.bind(cursor);
          let _cursorContinuePrimaryKey = cursor.continuePrimaryKey;
          if (_cursorContinuePrimaryKey) _cursorContinuePrimaryKey = _cursorContinuePrimaryKey.bind(cursor);
          const _cursorAdvance = cursor.advance.bind(cursor);
          const doThrowCursorIsNotStarted = ()=>{throw new Error("Cursor not started");}
          const doThrowCursorIsStopped = ()=>{throw new Error("Cursor not stopped");}
          (cursor as any).trans = trans;
          cursor.stop = cursor.continue = cursor.continuePrimaryKey = cursor.advance = doThrowCursorIsNotStarted;
          cursor.fail = wrap(reject);
          cursor.next = function (this: DBCoreCursor) {
            // next() must work with "this" pointer in order to function correctly for ProxyCursors (derived objects)
            // without having to re-define next() on each child.
            let gotOne = 1;
            return this.start(() => gotOne-- ? this.continue() : this.stop()).then(() => this);
          };
          cursor.start = (callback) => {
            //console.log("Starting cursor", (cursor as any).___id);
            const iterationPromise = new Promise<void>((resolveIteration, rejectIteration) =>{
              resolveIteration = wrap(resolveIteration);
              req.onerror = eventRejectHandler(rejectIteration);
              cursor.fail = rejectIteration;
              cursor.stop = value => {
                //console.log("Cursor stop", cursor);
                cursor.stop = cursor.continue = cursor.continuePrimaryKey = cursor.advance = doThrowCursorIsStopped;
                resolveIteration(value);
              };
            });
            // Now change req.onsuccess to a callback that doesn't call initCursor but just observer.next()
            const guardedCallback = () => {
              if (req.result) {
                //console.log("Next result", cursor);
                try {
                  callback();
                } catch (err) {
                  cursor.fail(err);
                }
              } else {
                (cursor as any).done = true;
                cursor.start = ()=>{throw new Error("Cursor behind last entry");}
                cursor.stop();
              }
            }
            req.onsuccess = wrap(ev => {
              //cursor.continue = _cursorContinue;
              //cursor.continuePrimaryKey = _cursorContinuePrimaryKey;
              //cursor.advance = _cursorAdvance;
              req.onsuccess = guardedCallback;
              guardedCallback();
            });
            cursor.continue = _cursorContinue;
            cursor.continuePrimaryKey = _cursorContinuePrimaryKey;
            cursor.advance = _cursorAdvance;
            guardedCallback();
            return iterationPromise;
          };
          resolve(cursor);
        }, reject); 
      });
    }
  
    function query (hasGetAll: boolean) {
      return (request: DBCoreQueryRequest) => {
        return new Promise<DBCoreQueryResponse>((resolve, reject) => {
          resolve = wrap(resolve);
          const {trans, values, limit, query} = request;
          const nonInfinitLimit = limit === Infinity ? undefined : limit;
          const {index, range} = query;
          const store = (trans as IDBTransaction).objectStore(tableName);
          const source = index.isPrimaryKey ? store : store.index(index.name);
          const idbKeyRange = makeIDBKeyRange(range);
          if (limit === 0) return resolve({result: []});
          if (hasGetAll) {
            const req = values ?
                (source as any).getAll(idbKeyRange, nonInfinitLimit) :
                (source as any).getAllKeys(idbKeyRange, nonInfinitLimit);
            req.onsuccess = event => resolve({result: event.target.result});
            req.onerror = eventRejectHandler(reject);
          } else {
            let count = 0;
            const req = values || !('openKeyCursor' in source) ?
              source.openCursor(idbKeyRange) :
              source.openKeyCursor(idbKeyRange)
            const result = [];
            req.onsuccess = event => {
              const cursor = req.result as IDBCursorWithValue;
              if (!cursor) return resolve({result});
              result.push(values ? cursor.value : cursor.primaryKey);
              if (++count === limit) return resolve({result});
              cursor.continue();
            };
            req.onerror = eventRejectHandler(reject);
          }
        });
      };
    }
  
    return {
      name: tableName,
      schema: tableSchema,
      
      mutate,

      getMany ({trans, keys}) {
        return new Promise<any[]>((resolve, reject) => {
          resolve = wrap(resolve);
          const store = (trans as IDBTransaction).objectStore(tableName);
          const length = keys.length;
          const result = new Array(length);
          let keyCount = 0;
          let callbackCount = 0;
          let valueCount = 0;
          let req: IDBRequest & {_pos?: number};
    
          const successHandler = event => {
            const req = event.target;
            if ((result[req._pos] = req.result) != null) ++valueCount;
            if (++callbackCount === keyCount) resolve(result);
          };
          const errorHandler = eventRejectHandler(reject);
    
          for (let i=0; i<length; ++i) {
            const key = keys[i];
            if (key != null) {
              req = store.get(keys[i]);
              req._pos = i;
              req.onsuccess = successHandler;
              req.onerror = errorHandler;
              ++keyCount;
            }
          }
          if (keyCount === 0) resolve(result);
        });
      },

      get ({trans, key}) {
        return new Promise<any>((resolve, reject) => {
          resolve = wrap (resolve);
          const store = (trans as IDBTransaction).objectStore(tableName);
          const req = store.get(key);
          req.onsuccess = event => resolve((event.target as any).result);
          req.onerror = eventRejectHandler(reject);
        });
      },

      query: query(hasGetAll),
      
      openCursor,

      count ({query, trans}) {
        const {index, range} = query;
        return new Promise<number>((resolve, reject) => {
          const store = (trans as IDBTransaction).objectStore(tableName);
          const source = index.isPrimaryKey ? store : store.index(index.name);
          const idbKeyRange = makeIDBKeyRange(range);
          const req = idbKeyRange ? source.count(idbKeyRange) : source.count();
          req.onsuccess = wrap(ev => resolve((ev.target as IDBRequest).result));
          req.onerror = eventRejectHandler(reject);
        });
      }
    };
  }

  const {schema, hasGetAll} = extractSchema(db, tmpTrans);
  const tables = schema.tables.map(tableSchema => createDbCoreTable(tableSchema));
  const tableMap: {[name: string]: DBCoreTable} = {};
  tables.forEach(table => tableMap[table.name] = table);
  return {
    stack: "dbcore",
    
    transaction: db.transaction.bind(db),

    table(name: string) {
      const result = tableMap[name];
      if (!result) throw new Error(`Table '${name}' not found`);
      return tableMap[name];
    },

    cmp,

    MIN_KEY: -Infinity,

    MAX_KEY: getMaxKey(IdbKeyRange),

    schema

  };
}
