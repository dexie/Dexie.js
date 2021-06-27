import { WhereClause as IWhereClause } from "../../public/types/where-clause";
import { Collection } from "../collection";
import { Table } from "../table";
import { IndexableType } from "../../public/types/indexable-type";
import { emptyCollection, fail, addIgnoreCaseAlgorithm, createRange, rangeEqual } from './where-clause-helpers';
import { INVALID_KEY_ARGUMENT, STRING_EXPECTED, maxString, minKey } from '../../globals/constants';
import { getArrayOf, NO_CHAR_ARRAY } from '../../functions/utils';
import { exceptions } from '../../errors';
import { Dexie } from '../dexie';
import { Collection as ICollection} from "../../public/types/collection";

/** class WhereClause
 * 
 * http://dexie.org/docs/WhereClause/WhereClause
 */
export class WhereClause implements IWhereClause {
  db: Dexie;
  _IDBKeyRange: typeof IDBKeyRange;
  _ctx: {
    table: Table;
    index: string;
    or: Collection;
  }
  _cmp: (a: IndexableType, b: IndexableType) => number;
  _ascending: (a: IndexableType, b: IndexableType) => number;
  _descending: (a: IndexableType, b: IndexableType) => number;
  _min: (a: IndexableType, b: IndexableType) => IndexableType;
  _max: (a: IndexableType, b: IndexableType) => IndexableType;

  get Collection() {
    return this._ctx.table.db.Collection;
  }

  /** WhereClause.between()
   * 
   * http://dexie.org/docs/WhereClause/WhereClause.between()
   * 
   **/
  between(lower: IndexableType, upper: IndexableType, includeLower?: boolean, includeUpper?: boolean) {
    includeLower = includeLower !== false;   // Default to true
    includeUpper = includeUpper === true;    // Default to false
    try {
      if ((this._cmp(lower, upper) > 0) ||
        (this._cmp(lower, upper) === 0 && (includeLower || includeUpper) && !(includeLower && includeUpper)))
        return emptyCollection(this); // Workaround for idiotic W3C Specification that DataError must be thrown if lower > upper. The natural result would be to return an empty collection.
      return new this.Collection(this, ()=>createRange(lower, upper, !includeLower, !includeUpper));
    } catch (e) {
      return fail(this, INVALID_KEY_ARGUMENT);
    }
  }

  /** WhereClause.equals()
   * 
   * http://dexie.org/docs/WhereClause/WhereClause.equals()
   * 
   **/
  equals(value: IndexableType) {
    if (value == null) return fail(this, INVALID_KEY_ARGUMENT);
    return new this.Collection(this, () => rangeEqual(value)) as ICollection;
  }

  /** WhereClause.above()
   * 
   * http://dexie.org/docs/WhereClause/WhereClause.above()
   * 
   **/
  above(value: IndexableType) {
    if (value == null) return fail(this, INVALID_KEY_ARGUMENT);
    return new this.Collection(this, () => createRange(value, undefined, true));
  }

  /** WhereClause.aboveOrEqual()
   * 
   * http://dexie.org/docs/WhereClause/WhereClause.aboveOrEqual()
   * 
   **/
  aboveOrEqual(value: IndexableType) {
    if (value == null) return fail(this, INVALID_KEY_ARGUMENT);
    return new this.Collection(this, () => createRange(value, undefined, false));
  }

  /** WhereClause.below()
   * 
   * http://dexie.org/docs/WhereClause/WhereClause.below()
   * 
   **/
  below(value: IndexableType) {
    if (value == null) return fail(this, INVALID_KEY_ARGUMENT);
    return new this.Collection(this, () => createRange(undefined, value, false, true));
  }

  /** WhereClause.belowOrEqual()
   * 
   * http://dexie.org/docs/WhereClause/WhereClause.belowOrEqual()
   * 
   **/
  belowOrEqual(value: IndexableType) {
    if (value == null) return fail(this, INVALID_KEY_ARGUMENT);
    return new this.Collection(this, () => createRange(undefined, value));
  }

  /** WhereClause.startsWith()
   * 
   * http://dexie.org/docs/WhereClause/WhereClause.startsWith()
   * 
   **/
  startsWith(str: string) {
    if (typeof str !== 'string') return fail(this, STRING_EXPECTED);
    return this.between(str, str + maxString, true, true);
  }

  /** WhereClause.startsWithIgnoreCase()
   * 
   * http://dexie.org/docs/WhereClause/WhereClause.startsWithIgnoreCase()
   * 
   **/
  startsWithIgnoreCase(str: string) {
    if (str === "") return this.startsWith(str);
    return addIgnoreCaseAlgorithm(this, (x, a) => x.indexOf(a[0]) === 0, [str], maxString);
  }

  /** WhereClause.equalsIgnoreCase()
   * 
   * http://dexie.org/docs/WhereClause/WhereClause.equalsIgnoreCase()
   * 
   **/
  equalsIgnoreCase(str: string) {
    return addIgnoreCaseAlgorithm(this, (x, a) => x === a[0], [str], "");
  }

  /** WhereClause.anyOfIgnoreCase()
   * 
   * http://dexie.org/docs/WhereClause/WhereClause.anyOfIgnoreCase()
   * 
   **/
  anyOfIgnoreCase(...values: string[]): Collection;
  anyOfIgnoreCase(values: string[]): Collection;
  anyOfIgnoreCase() {
    var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
    if (set.length === 0) return emptyCollection(this);
    return addIgnoreCaseAlgorithm(this, (x, a) => a.indexOf(x) !== -1, set, "");
  }

  /** WhereClause.startsWithAnyOfIgnoreCase()
   * 
   * http://dexie.org/docs/WhereClause/WhereClause.startsWithAnyOfIgnoreCase()
   * 
   **/
  startsWithAnyOfIgnoreCase(...values: string[]): Collection;
  startsWithAnyOfIgnoreCase(values: string[]): Collection;
  startsWithAnyOfIgnoreCase() {
    var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
    if (set.length === 0) return emptyCollection(this);
    return addIgnoreCaseAlgorithm(this, (x, a) => a.some(n => x.indexOf(n) === 0), set, maxString);
  }

  /** WhereClause.anyOf()
   * 
   * http://dexie.org/docs/WhereClause/WhereClause.anyOf()
   * 
   **/
  anyOf(...values: string[]): Collection;
  anyOf(values: string[]): Collection;
  anyOf() {
    const set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
    let compare = this._cmp;
    try { set.sort(compare); } catch (e) { return fail(this, INVALID_KEY_ARGUMENT); }
    if (set.length === 0) return emptyCollection(this);
    const c = new this.Collection(this, () => createRange(set[0], set[set.length - 1]));

    c._ondirectionchange = direction => {
      compare = (direction === "next" ?
        this._ascending :
        this._descending);
      set.sort(compare);
    };

    let i = 0;
    c._addAlgorithm((cursor, advance, resolve) => {
      const key = cursor.key;
      while (compare(key, set[i]) > 0) {
        // The cursor has passed beyond this key. Check next.
        ++i;
        if (i === set.length) {
          // There is no next. Stop searching.
          advance(resolve);
          return false;
        }
      }
      if (compare(key, set[i]) === 0) {
        // The current cursor value should be included and we should continue a single step in case next item has the same key or possibly our next key in set.
        return true;
      } else {
        // cursor.key not yet at set[i]. Forward cursor to the next key to hunt for.
        advance(() => { cursor.continue(set[i]); });
        return false;
      }
    });
    return c;
  }

  /** WhereClause.notEqual()
   * 
   * http://dexie.org/docs/WhereClause/WhereClause.notEqual()
   * 
   **/
  notEqual(value: IndexableType) {
    return this.inAnyRange([[minKey, value], [value, this.db._maxKey]], { includeLowers: false, includeUppers: false });
  }

  /** WhereClause.noneOf()
   * 
   * http://dexie.org/docs/WhereClause/WhereClause.noneOf()
   * 
   **/
  noneOf(...values: string[]): Collection;
  noneOf(values: string[]): Collection;
  noneOf() {
    const set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
    if (set.length === 0) return new this.Collection(this); // Return entire collection.
    try { set.sort(this._ascending); } catch (e) { return fail(this, INVALID_KEY_ARGUMENT); }
    // Transform ["a","b","c"] to a set of ranges for between/above/below: [[minKey,"a"], ["a","b"], ["b","c"], ["c",maxKey]]
    const ranges = set.reduce(
      (res, val) => res ?
        res.concat([[res[res.length - 1][1], val]]) :
        [[minKey, val]],
      null);
    ranges.push([set[set.length - 1], this.db._maxKey]);
    return this.inAnyRange(ranges, { includeLowers: false, includeUppers: false });
  }

  /** WhereClause.inAnyRange()
   * 
   * http://dexie.org/docs/WhereClause/WhereClause.inAnyRange()
   * 
   **/
  inAnyRange(
    ranges: ReadonlyArray<{ 0: IndexableType, 1: IndexableType }>,
    options?: { includeLowers?: boolean, includeUppers?: boolean })
  {
    const cmp = this._cmp,
          ascending = this._ascending,
          descending = this._descending,
          min = this._min,
          max = this._max;

    if (ranges.length === 0) return emptyCollection(this);
    if (!ranges.every(range =>
      range[0] !== undefined &&
      range[1] !== undefined &&
      ascending(range[0], range[1]) <= 0)) {
      return fail(
        this,
        "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower",
        exceptions.InvalidArgument);
    }
    const includeLowers = !options || options.includeLowers !== false;   // Default to true
    const includeUppers = options && options.includeUppers === true;    // Default to false

    function addRange(ranges, newRange) {
      let i = 0, l = ranges.length;
      for (; i < l; ++i) {
        const range = ranges[i];
        if (cmp(newRange[0], range[1]) < 0 && cmp(newRange[1], range[0]) > 0) {
          range[0] = min(range[0], newRange[0]);
          range[1] = max(range[1], newRange[1]);
          break;
        }
      }
      if (i === l)
        ranges.push(newRange);
      return ranges;
    }

    let sortDirection = ascending;
    function rangeSorter(a, b) { return sortDirection(a[0], b[0]); }

    // Join overlapping ranges
    let set;
    try {
      set = ranges.reduce(addRange, []);
      set.sort(rangeSorter);
    } catch (ex) {
      return fail(this, INVALID_KEY_ARGUMENT);
    }

    let rangePos = 0;
    const keyIsBeyondCurrentEntry = includeUppers ?
      key => ascending(key, set[rangePos][1]) > 0 :
      key => ascending(key, set[rangePos][1]) >= 0;

    const keyIsBeforeCurrentEntry = includeLowers ?
      key => descending(key, set[rangePos][0]) > 0 :
      key => descending(key, set[rangePos][0]) >= 0;

    function keyWithinCurrentRange(key) {
      return !keyIsBeyondCurrentEntry(key) && !keyIsBeforeCurrentEntry(key);
    }

    let checkKey = keyIsBeyondCurrentEntry;

    const c = new this.Collection(
      this,
      () => createRange(set[0][0], set[set.length - 1][1], !includeLowers, !includeUppers));

    c._ondirectionchange = direction => {
      if (direction === "next") {
        checkKey = keyIsBeyondCurrentEntry;
        sortDirection = ascending;
      } else {
        checkKey = keyIsBeforeCurrentEntry;
        sortDirection = descending;
      }
      set.sort(rangeSorter);
    };

    c._addAlgorithm((cursor, advance, resolve) => {
      var key = cursor.key;
      while (checkKey(key)) {
        // The cursor has passed beyond this key. Check next.
        ++rangePos;
        if (rangePos === set.length) {
          // There is no next. Stop searching.
          advance(resolve);
          return false;
        }
      }
      if (keyWithinCurrentRange(key)) {
        // The current cursor value should be included and we should continue a single step in case next item has the same key or possibly our next key in set.
        return true;
      } else if (this._cmp(key, set[rangePos][1]) === 0 || this._cmp(key, set[rangePos][0]) === 0) {
        // includeUpper or includeLower is false so keyWithinCurrentRange() returns false even though we are at range border.
        // Continue to next key but don't include this one.
        return false;
      } else {
        // cursor.key not yet at set[i]. Forward cursor to the next key to hunt for.
        advance(() => {
          if (sortDirection === ascending) cursor.continue(set[rangePos][0]);
          else cursor.continue(set[rangePos][1]);
        });
        return false;
      }
    });
    return c;
  }

  /** WhereClause.startsWithAnyOf()
   * 
   * http://dexie.org/docs/WhereClause/WhereClause.startsWithAnyOf()
   * 
   **/
  startsWithAnyOf(...prefixes: string[]): Collection;
  startsWithAnyOf(prefixes: string[]): Collection;
  startsWithAnyOf() {
    const set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);

    if (!set.every(s => typeof s === 'string')) {
        return fail(this, "startsWithAnyOf() only works with strings");
    }
    if (set.length === 0) return emptyCollection(this);

    return this.inAnyRange(set.map((str: string) => [str, str + maxString]));
  }

}
