import { delArrayItem, isArray } from '../../functions/utils';
import { TblQueryCache } from '../../public/types/cache';
import {
  DBCoreMutateRequest,
  DBCoreMutateResponse,
} from '../../public/types/dbcore';

export function adjustOptimisticFromFailures(
  tblCache: TblQueryCache,
  req: DBCoreMutateRequest,
  res: DBCoreMutateResponse
): DBCoreMutateRequest {
  if (res.numFailures === 0) return req;
  if (req.type === 'deleteRange') {
    // numFailures > 0 means the deleteRange operation failed in its whole.
    return null;
  }

  const numBulkOps = req.keys
    ? req.keys.length
    : 'values' in req && req.values
    ? req.values.length
    : 1;
  if (res.numFailures === numBulkOps) {
    // Same number of failures as the number of ops. This means that all ops failed.
    return null;
  }

  const clone: DBCoreMutateRequest = { ...req };

  if (isArray(clone.keys)) {
    clone.keys = clone.keys.filter((_, i) => !(i in res.failures));
  }
  if ('values' in clone && isArray(clone.values)) {
    clone.values = clone.values.filter((_, i) => !(i in res.failures));
  }
  return clone;
}
