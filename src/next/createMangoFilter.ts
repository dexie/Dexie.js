import { cmp, Dexie } from '../..';
import { MangoExpression, MangoRange } from './MangoExpression';

export function createMangoFilter(expr: MangoExpression): (obj: any) => boolean {
  const { getByKeyPath } = Dexie;

  function matchesRange(value: any, range: MangoRange): boolean {
    // Handle $eq
    if ('$eq' in range) {
      if (cmp(value, range.$eq) !== 0) return false;
    }

    // Handle $ne
    if ('$ne' in range) {
      if (cmp(value, range.$ne) === 0) return false;
    }

    // Handle $gt
    if ('$gt' in range) {
      if (cmp(value, range.$gt) <= 0) return false;
    }

    // Handle $gte
    if ('$gte' in range) {
      if (cmp(value, range.$gte) < 0) return false;
    }

    // Handle $lt
    if ('$lt' in range) {
      if (cmp(value, range.$lt) >= 0) return false;
    }

    // Handle $lte
    if ('$lte' in range) {
      if (cmp(value, range.$lte) > 0) return false;
    }

    // Handle $in
    if ('$in' in range && range.$in) {
      if (!range.$in.some((item: any) => cmp(value, item) === 0)) {
        return false;
      }
    }

    // Handle $nin
    if ('$nin' in range && range.$nin) {
      if (range.$nin.some((item: any) => cmp(value, item) === 0)) {
        return false;
      }
    }

    // Handle $inRanges
    if ('$inRanges' in range && range.$inRanges) {
      if (!range.$inRanges.some((r: MangoRange) => matchesRange(value, r))) {
        return false;
      }
    }

    return true;
  }

  function matchesExpression(obj: any, expr: MangoExpression): boolean {
    // Handle $and
    if ('$and' in expr) {
      return expr.$and.every((subExpr: MangoExpression) => matchesExpression(obj, subExpr));
    }

    // Handle $or
    if ('$or' in expr) {
      return expr.$or.some((subExpr: MangoExpression) => matchesExpression(obj, subExpr));
    }

    // Handle property comparisons
    for (const prop in expr) {
      const expectedValue = (expr as any)[prop];
      const actualValue = getByKeyPath(obj, prop);

      // If expectedValue is a MangoRange (object with operators)
      if (
        typeof expectedValue === 'object' &&
        expectedValue !== null &&
        !Array.isArray(expectedValue)
      ) {
        // Check if it's a range object (has $ properties)
        const keys = Object.keys(expectedValue);
        if (keys.length > 0 && keys.some((k) => k.startsWith('$'))) {
          if (!matchesRange(actualValue, expectedValue as MangoRange)) {
            return false;
          }
          continue;
        }
      }

      // Direct value comparison
      if (cmp(actualValue, expectedValue) !== 0) {
        return false;
      }
    }

    return true;
  }

  return (obj: any) => matchesExpression(obj, expr);
}
