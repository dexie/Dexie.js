import { getFromTransactionCache } from "../dbcore/cache-existing-values-middleware";
import { cmp } from "../functions/cmp";
import { isArray, keys } from "../functions/utils";
import { PSD } from "../helpers/promise";
import { RangeSet } from "../helpers/rangeset";
import { ObservabilitySet, TxCommittedData } from "../public/types/db-events";
import {
  DBCore,
  DBCoreCountRequest,
  DBCoreCursor,
  DBCoreGetManyRequest,
  DBCoreGetRequest,
  DBCoreIndex,
  DBCoreOpenCursorRequest,
  DBCoreQueryRequest,
  DBCoreQueryResponse,
  DBCoreTable,
  DBCoreTableSchema,
  DBCoreTransaction,
} from "../public/types/dbcore";
import { Middleware } from "../public/types/middleware";

export const observabilityMiddleware: Middleware<DBCore> = {
  stack: "dbcore",
  level: 0,
  create: (core) => {
    const dbName = core.schema.name;

    return {
      ...core,
      table: (tableName) => {
        const table = core.table(tableName);
        const { schema } = table;
        const { primaryKey } = schema;
        const { extractKey, outbound } = primaryKey;
        return {
          ...table,
          mutate: (req) => {
            const trans = req.trans as DBCoreTransaction & {
              mutatedParts?: TxCommittedData;
            };

            /* TODO!
              1. Do the same as in observability-middleware to:
                 * Before executing request, find out whether we should bother here (max 50 items)
                 * If bother, deepClone(req) and put on an entry.
                 * After execution, if should bother:
                   * load from cache and put in entry.old
                   * deepClone res and put in entry.
                   * push entry to entries array on key `idb://${dbName}/${tableName}`.
                   * 
              2. Then, move code in observability middleware:
                 * read-queries: Stay the same.
                 * mutations. Delete code. Move to new "global" txcommitted listener in live-query.ts.
              3. New global txcommitted listener:
                 For each key, if true, convert it to {"": FULL_RANGE, ":dels": FULL_RANGE}
                 Else, loop throw entries and do the same as was done in observability-middleware for mutations.
                 Outout: an ObservabilitySet as it used to expect.
                 Now, emit this value to a new observable (use Rx?)
                 Continue executing code in liveQuery 
            */
           return table.mutate(req);
          }
        }
      },
    };
  },
};

function trackAffectedIndexes(
  getRangeSet: (index: string) => RangeSet,
  schema: DBCoreTableSchema,
  oldObjs: any[] | undefined,
  newObjs: any[] | undefined
) {
  function addAffectedIndex(ix: DBCoreIndex) {
    const rangeSet = getRangeSet(ix.name || "");
    function extractKey(obj: any) {
      return obj != null ? ix.extractKey(obj) : null;
    }
    (oldObjs || newObjs).forEach((_, i) => {
      const oldKey = oldObjs && extractKey(oldObjs[i]);
      const newKey = newObjs && extractKey(newObjs[i]);
      if (cmp(oldKey, newKey) !== 0) {
        oldKey && rangeSet.addKey(oldKey);
        newKey && rangeSet.addKey(newKey);
      }
    });
  }
  schema.indexes.forEach(addAffectedIndex);
}
