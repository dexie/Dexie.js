import { Collection, FilteredCollection } from "./Collection";

export class WhereClause {
  _coll: Collection;
  _prop: string
  _op: 'or' | 'and';

  constructor(expression: Collection, prop: string, op: 'or' | 'and') {
    this._coll = expression;
    this._prop = prop;
    this._op = op;
  }

  equals(value: any): Collection {
    return new FilteredCollection(this._coll, { [this._prop]: { $eq: value } }, this._op);
  }
  above(value: any): Collection {
    return new FilteredCollection(this._coll, { [this._prop]: { $gt: value } }, this._op);
  }
  aboveOrEqual(value: any): Collection {
    return new FilteredCollection(this._coll, {
      [this._prop]: { $gte: value },
    }, this._op);
  }
  before(value: any): Collection {
    return new FilteredCollection(this._coll, { [this._prop]: { $lt: value } }, this._op);
  }
  beforeOrEqual(value: any): Collection {
    return new FilteredCollection(this._coll, {
      [this._prop]: { $lte: value },
    }, this._op);
  }
  below(value: any): Collection {
    return new FilteredCollection(this._coll, { [this._prop]: { $lt: value } }, this._op);
  }
  belowOrEqual(value: any): Collection {
    return new FilteredCollection(this._coll, {
      [this._prop]: { $lte: value },
    }, this._op);
  }
  after(value: any): Collection {
    return new FilteredCollection(this._coll, { [this._prop]: { $gt: value } }, this._op);
  }
  afterOrEqual(value: any): Collection {
    return new FilteredCollection(this._coll, {
      [this._prop]: { $gte: value },
    }, this._op);
  }
  startsWith(value: string): Collection {
    return new FilteredCollection(this._coll, {
      [this._prop]: { $gte: value, $lt: value + '\uffff' },
    }, this._op);
  }
  startsWithAnyOf(...prefixes: string[]): Collection {
    return this.inAnyRange(
      prefixes.map((prefix) => [prefix, prefix + '\uffff'])
    );
  }

  /** Backward compatible with dexie 4's between(), excluding upper bound by default.
   * Name change to signal intent */
  range(
    lower: any,
    upper: any,
    includeLower?: boolean,
    includeUpper?: boolean
  ): Collection {
    return this.isBetween(lower, upper, {
      includeLower: includeLower ?? true,
      includeUpper: includeUpper ?? false,
    });
  }

  /** New in dexie 5. Unlike dexie 4's between, it defaults to including upper bound. */
  isBetween(
    lower: any,
    upper: any,
    { includeLower = true, includeUpper = true } = {}
  ): Collection {
    return new FilteredCollection(this._coll, {
      [this._prop]: {
        ...(includeLower ? { $gte: lower } : { $gt: lower }),
        ...(includeUpper ? { $lte: upper } : { $lt: upper }),
      },
    }, this._op);
  }

  anyOf(keys: ReadonlyArray<any>): Collection {
    return new FilteredCollection(this._coll, {
      [this._prop]: { $in: keys },
    }, this._op);
  }
  noneOf(keys: ReadonlyArray<any>): Collection {
    return new FilteredCollection(this._coll, {
      [this._prop]: { $nin: keys },
    }, this._op);
  }
  notEqual(value: any): Collection {
    return new FilteredCollection(this._coll, { [this._prop]: { $ne: value } }, this._op);
  }
  inAnyRange(
    ranges: ReadonlyArray<[any, any]>,
    {
      includeLowers = true,
      includeUppers = false,
    }: { includeLowers?: boolean; includeUppers?: boolean } = {}
  ): Collection {
    return new FilteredCollection(this._coll, {
      [this._prop]: {
        $inRanges: ranges.map(([lower, upper]) => {
          const range: any = {};
          if (includeLowers) {
            range.$gte = lower;
          } else {
            range.$gt = lower;
          }
          if (includeUppers) {
            range.$lte = upper;
          } else {
            range.$lt = upper;
          }
          return range;
        }),
      },
    }, this._op);
  }
}
