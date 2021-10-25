import { exceptions } from '../../errors';
import { type } from '../../functions/cmp';
import { keys } from '../../functions/utils';
import { maxString } from '../../globals/constants';
import { IndexableType } from '../../public';
import type { WhereClause } from '../where-clause/where-clause';

export function resolveMango(mango: any): [keyof WhereClause, any[]] {
  if (type(mango) !== 'Object') {
    return ['equals', [mango]];
  }
  const {$gt, $gte, $lt, $lte} = mango;
  if ($gt != null || $gte != null) {
    if ($lt != null || $lte != null) {
      return ["between", [$gt != null ? $gt : $gte, $lt != null ? $lt : $lte, $gte != null, $lte != null]];
    }
    return $gt != null ? ["above", [$gt]] : ["aboveOrEqual", [$gte]];
  }
  if ($lt != null) return ["below", [$lt]];
  if ($lte != null) return ["belowOrEqual", [$lte]];
  //if ($in != null) return ["anyOf", [$in]];
  throw new exceptions.Type(`Invalid mango expression`);
}

export function above(lower: IndexableType) {
  return {$gt: lower};
}

export function aboveOrEqual(lower: IndexableType) {
  return {$gte: lower};
}

export function below(upper: IndexableType) {
  return {$lt: upper};
}

export function belowOrEqual(upper: IndexableType) {
  return {$lte: upper};
}

export function between(lower: IndexableType, upper: IndexableType) {
  return {
    $gte: lower,
    $lte: upper,
    excludeLower() {
      this.$gt = this.$gte;
      delete this.$gt;
      return this;
    },
    excludeUpper() {
      this.$lt = this.$lte;
      delete this.$lt;
      return this;
    }
  }
}

export function startsWith(prefix: string) {
  return {
    $gte: prefix,
    $lte: prefix + maxString
  };
}

/*export function anyOf(keys: IndexableTypeArrayReadonly) {
  return {
    $in: keys
  }
}
*/