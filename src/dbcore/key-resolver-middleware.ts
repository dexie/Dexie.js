import { getEffectiveKeys } from '../dbcore/get-effective-keys';
import { DBCore } from '../public/types/dbcore';

/** Resolve effective keys into req.keys on all mutate requests.
 * This will make DBCore able to set results array in the response
 * by cloning the effective keys and add auto-incremented results where
 * applicable.
 * 
 * This middleware should run on a high prio before other middlewares.
 * Also hooks middleware can take advantage of this info.
 */
export function createKeyResolverMiddleware(down: DBCore) : DBCore {
  return {
    ...down,
    table (tableName) {
      const table = down.table(tableName);
      const {primaryKey} = table.schema;
      return {
        ...table,
        mutate(req) {
          if (req.type === 'add' || req.type === 'put') {
            const keys = getEffectiveKeys(primaryKey, req);
            req = {...req, keys};
            return table.mutate(req);
          }
        }
      };
    }
  }
}