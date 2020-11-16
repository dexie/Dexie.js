import { getEffectiveKeys } from '../../dbcore/get-effective-keys';
import { extend, isAsyncFunction, keys } from "../../functions/utils";
import { globalEvents } from '../../globals/global-events';
import {
  decrementExpectedAwaits,
  incrementExpectedAwaits,
  newScope,
  PSD,
  usePSD,
} from "../../helpers/promise";
import { ObservabilitySet } from "../../public/types/db-events";
import {
  DBCore,
  DBCoreCountRequest,
  DBCoreGetManyRequest,
  DBCoreGetRequest,
  DBCoreOpenCursorRequest,
  DBCoreQueryRequest,
  DBCoreRangeType,
  DBCoreTable,
  DBCoreTransaction,
} from "../../public/types/dbcore";
import { Middleware } from "../../public/types/middleware";
import { Observable as IObservable, Subscription } from "../../public/types/observable";
import { Observable } from "../observable/observable";

export function liveQuery<T>(querier: () => T | Promise<T>): IObservable<T> {
  return new Observable<T>(({start, next, error}) => {
    const scopeFuncIsAsync = isAsyncFunction(querier);
    function execute(subscr: ObservabilitySet) {
      if (scopeFuncIsAsync) {
        incrementExpectedAwaits();
      }
      const exec = () => newScope(querier, { subscr, trans: null });
      const rv = PSD.trans
        ? // Ignore current transaction if active when calling subscribe().
          usePSD(PSD.transless, exec)
        : exec();
      if (scopeFuncIsAsync) {
        (rv as Promise<any>).then(decrementExpectedAwaits, decrementExpectedAwaits);
      }
      return rv;
    }

    let closed = false;

    let accumMuts: ObservabilitySet = {};
    let currentObs: ObservabilitySet = {};

    const subscription: Subscription = {
      get closed() {
        return closed;
      },
      unsubscribe: () => {
        closed = true;
        globalEvents.txcommitted.unsubscribe(mutationListener);
      },
    };

    start && start(subscription); // https://github.com/tc39/proposal-observable

    let querying = false,
        startedListening = false;

    function shouldNotify() {
      for (const db of keys(currentObs)) {
        const mutDb = accumMuts[db];
        if (mutDb) {
          const obsDb = currentObs[db];
          for (const table of keys(obsDb)) {
            const mutTable = mutDb[table];
            const obsTable = obsDb[table];
            if (mutTable === true || obsTable === true) return true;
            return (obsTable.keys.some(key => mutTable.keys.some(mKey => {
              try {return obsTable.cmp!(key, mKey) === 0;} catch (_) {return false;}
            })));
          }
        }
      }
      return false;
    }

    const mutationListener = (parts: ObservabilitySet) => {
      extendObservabilitySet(accumMuts, parts);
      if (shouldNotify()) {
        doQuery();
      }
    };

    const doQuery = () => {
      if (querying || closed) return;
      accumMuts = {};
      const subscr: ObservabilitySet = {};
      const ret = execute(subscr);
      if (!startedListening) {
        globalEvents("txcommitted", mutationListener);
        startedListening = true;
      }
      querying = true;
      Promise.resolve(ret).then(
        (result) => {
          querying = false;
          if (closed) return;
          if (shouldNotify()) {
            // Mutations has happened while we were querying. Redo query.
            doQuery();
          } else {
            accumMuts = {};
            // Update what we are subscribing for based on this last run:
            currentObs = subscr;
            next && next(result);
          }
        },
        (err) => {
          querying = false;
          error && error(err);
          subscription.unsubscribe();
        }
      );
    };

    doQuery();
    return subscription;
  });
}

export function extendObservabilitySet(
  target: ObservabilitySet,
  newSet: ObservabilitySet
): ObservabilitySet {
  keys(newSet).forEach((dbName) => {
    const targetTableSet = target[dbName];
    const newTableSet = newSet[dbName];
    if (targetTableSet) {
      // merge os1[dbName] with os2[dbName]
      keys(newTableSet).forEach((tableName) => {
        const targetPart = targetTableSet[tableName];
        if (targetPart && targetPart !== true && targetPart.keys) {
          const newPart = newTableSet[tableName];
          if (newPart === true) {
            targetTableSet[tableName] = true;
          } else if (newPart.keys) {
            targetTableSet[tableName] = { keys: targetPart.keys.concat(newPart.keys) };
          }
        }
      });
    } else {
      target[dbName] = newTableSet;
    } 
  });
  return target;
}

export const observabilityMiddleware: Middleware<DBCore> = {
  stack: "dbcore",
  level: 0,
  create: (core) => {
    const dbName = core.schema.name;
    const getKey = (req: DBCoreGetRequest) => [req.key];
    const getKeys = (req: DBCoreGetManyRequest) => req.keys;
    const getQueryKey = ({
      query: { index, range },
    }: DBCoreQueryRequest | DBCoreCountRequest | DBCoreOpenCursorRequest) =>
      index.isPrimaryKey &&
      range.type === DBCoreRangeType.Equal && [range.lower];

    const readSubscribers: [
      Exclude<keyof DBCoreTable, "name" | "schema" | "mutate">,
      undefined | ((req: any) => any[])
    ][] = [
      ["get", getKey],
      ["getMany", getKeys],
      ["count", getQueryKey],
      ["query", getQueryKey],
      ["openCursor", getQueryKey],
    ];

    return {
      ...core,
      table: (tableName) => {
        const table = core.table(tableName);
        const tableClone: DBCoreTable = {
          ...table,
          mutate: (req) => {
            const keys =
              req.type !== "deleteRange" &&
              (req.type === "delete"
                ? req.keys
                : (req.keys = getEffectiveKeys(table.schema.primaryKey, req)));
            const trans = req.trans as DBCoreTransaction & {
              mutatedParts?: ObservabilitySet;
            };              
            return table.mutate(req).then((res) => {
              // Add the mutated table and optionally keys to the mutatedTables set on the transaction.
              // Used by subscribers to txcommit event and for Collection.prototype.subscribe().
              const mutatedParts: ObservabilitySet = {
                [dbName]: {[tableName]: keys && keys.every(k => k != null) ? { keys } : true}
              };
              if (!trans.mutatedParts) trans.mutatedParts = {};
              extendObservabilitySet(trans.mutatedParts, mutatedParts)
              return res;
            });
          },
        };
        readSubscribers.forEach(([method, getKeys]) => {
          tableClone[method] = function (req) {
            if (PSD.subscr) {
              // Current zone want's to track all queries so they can be subscribed to.
              // (The query is executed within a "liveQuery" zone)

              // Check whether the query applies to a certain set of keys:
              const keys = getKeys && getKeys(req);
              // Track what we should be observing:
              const observabilitySet: ObservabilitySet = {
                [dbName]: {
                  [tableName]: keys
                    ? // We're querying a single key, or a set of keys.
                      // In this case, don't subscribe to all changes in table - just those keys:
                      { keys, cmp: core.cmp }
                    : // The query is based on a secondary index, or is range based -
                      // Lets subscribe to all changes on the table
                      true
                }
              };
              extendObservabilitySet(PSD.subscr, observabilitySet);
            }
            return table[method].apply(this, arguments);
          };
        });
        return tableClone;
      },
    };
  },
};
