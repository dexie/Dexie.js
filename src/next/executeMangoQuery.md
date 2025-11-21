# executeMangoQuery.ts - Architecture Documentation

## Overview

This module implements an intelligent query execution engine for Dexie.js that optimizes MangoExpression queries against IndexedDB. It selects the best execution strategy based on available indexes, query complexity, and pagination requirements (limit/offset).

## Core Concepts

### MangoExpression Query Language

MangoExpression is a MongoDB-inspired query DSL that supports:

- **Equality**: `{ name: "foo" }` or `{ name: { $eq: "foo" } }`
- **Ranges**: `{ age: { $gt: 25, $lte: 65 } }`
- **Multiple Ranges**: `{ age: { $inRanges: [{ $gte: 20, $lte: 30 }, { $gte: 40, $lte: 50 }] } }`
- **Logical Operators**: `{ $and: [...] }`, `{ $or: [...] }`

### Type Hierarchy

```typescript
SimleMangoRange; // Simple range without $inRanges: { $gt, $gte, $lt, $lte, $eq }
MangoRange; // Extends SimleMangoRange, adds: { $inRanges?: SimleMangoRange[] }
MangoExpression; // Full query: props + $and/$or
```

## Architecture

### 1. Range Conversion Layer

#### `rangeFromMango(range: SimleMangoRange): DBCoreKeyRange`

Converts a single simple range (without `$inRanges`) to IndexedDB's native key range format.

**Validations:**

- Throws if lower > upper
- Throws if lower === upper with open boundaries
- Handles `$eq` as a special case with equal lower/upper bounds

#### `rangesFromMango(range: MangoRange): DBCoreKeyRange[]`

Handles `$inRanges` by expanding into multiple ranges, then:

1. Recursively calls `rangeFromMango()` on each sub-range
2. Sorts ranges by lower bound
3. **Merges overlapping ranges** to optimize query execution

**Merge Algorithm:**

- `[10,20]` + `[15,25]` → `[10,25]`
- `[10,20]` + `[20,30]` → `[10,30]` (adjacent with closed boundary)
- `[10,20)` + `(20,30]` → keeps both (gap at 20)
- `(-∞,30)` + `(-∞,50)` → `(-∞,50)` (unbounded ranges)

### 2. Index Analysis Layer

#### `findBestIndex(schema, expr, orderBy?)`

Analyzes which index best matches the query requirements.

**Scoring System:**

- +1 point for each equality prop matched
- +1 point for range prop matched
- +1 point for each orderBy prop matched
- Returns index with highest score

**Index Component Matching:**
For compound index `[realmId+name+age]`:

- Equality props can match in ANY order: `{name: "foo", realmId: "bar"}` ✓
- Range prop must come after all equalities: `{realmId: "bar", age: {$gt: 25}}` ✓
- OrderBy props must match remaining index components in order

**Example:**

```typescript
// Index: [realmId+name+age]
// Query: { realmId: "x", name: {$gte: "A"} }, orderBy: ['age']
// Matches: equality(realmId) + range(name) + orderBy(age) = score 3 ✓
```

#### `buildRangesForIndex(index, equalityProps, rangeProps)`

Constructs `DBCoreKeyRange[]` for a specific index by:

1. Building compound key prefix from equality values
2. Calling `rangesFromMango()` to get range(s) with `$inRanges` expansion
3. Prefixing each range with the compound key values

**Virtual Index Support:**
Works seamlessly with virtual-index-middleware which:

- Auto-creates sub-indexes for compound indexes (e.g., `[name+age]` → virtual `name`)
- Handles padding with MIN_KEY/MAX_KEY internally
- No special handling needed in this code!

#### `analyzeForIndex(schema, expr, orderBy?)`

Public API that combines index analysis and range building.

**Returns:**

```typescript
{
  index: DBCoreIndex,           // Best matching index
  ranges: DBCoreKeyRange[],     // Query ranges (may be multiple for $inRanges)
  partial?: MangoExpression,    // Props that need manual filtering
  orderByMatched: boolean       // True if index satisfies orderBy completely
}
```

### 3. Query Execution Layer

#### Strategy Selection Matrix

| Scenario         | Where Index | OrderBy Index | Filtering Needed | Limit | Strategy                        |
| ---------------- | ----------- | ------------- | ---------------- | ----- | ------------------------------- |
| Perfect match    | ✓           | ✓ (same)      | ✗                | Any   | **Direct query** (fast path)    |
| Where only       | ✓           | ✗             | ✗                | ∞     | Query + manual sort             |
| Where only       | ✓           | ✗             | ✗                | N     | Query + manual sort             |
| OrderBy priority | ?           | ✓             | ✓                | N     | **Cursor iteration** on orderBy |
| Where priority   | ✓           | ?             | ✓                | ∞     | Query on where + manual sort    |
| Complex $and/$or | N/A         | N/A           | N/A              | Any   | Recursive key extraction        |

#### `executeQuery(ctx: QueryContext): Promise<any[]>`

Main entry point that selects optimal strategy:

**Fast Paths:**

1. **Simple toArray()**: `!where && !orderBy && !offset` → Direct primary key scan
2. **Perfect index match**: `orderByMatched && !needsFiltering` → Single or parallel range queries
3. **OrderBy with limit**: `orderBy && limit && needsFiltering` → Cursor iteration

**Cursor vs Query Decision:**

- **Use cursor** when: `(offset > 0 || limit < ∞) && needsFiltering`
- **Use query** when: No offset, no limit, or limit without filtering

#### `executeWithCursor(core, index, range, filter?, offset, limit)`

Efficient cursor-based iteration for filtered + paginated queries.

**Algorithm:**

```javascript
skipped = 0, collected = 0
cursor.start(function iterate() {
  if (filter && !filter(cursor.value)) continue
  if (skipped < offset) { skipped++; continue }
  if (collected < limit) { collected++; results.push(value) }
  if (collected >= limit) { cursor.stop(); return }
  cursor.continue()
})
```

**When to use:**

- `where('age').above(25).orderBy('name').limit(10)` → Iterate 'name' index with age filter
- `where('age').above(25).orderBy('name').offset(10).limit(10)` → Skip 10, collect 10

#### `executeMangoQuery(ctx, expr, orderBy?): Promise<Set<keys>>`

Recursive key extraction for complex queries.

**Handles:**

- `$or` → Union of key sets from branches
- `$and` → Intersection of key sets from branches
- Simple expressions → Delegate to `analyzeForIndex` + `executeKeysQuery`

**Returns:** Set of primary keys that match the query (without values)

#### `executeKeysQuery(ctx, index, ranges, partialFilter?)`

Executes index queries (keys-only or with values if filtering needed).

- Single range → One query
- Multiple ranges → Parallel queries, merge results
- Applies partial filter if some props aren't index-covered

### 4. Helper Functions

#### `sortResults(results, orderBy, direction, schema)`

In-memory sorting fallback when no suitable index exists.

**Important:** Adds primary key to end of orderBy (mimics IndexedDB implicit behavior):

```typescript
// User requests: orderBy(['name'])
// Effective sort: ['name', 'id'] (PK added for deterministic ordering)
```

#### `isEqualityValue(value)`, `isRangeValue(value)`, `getEqualityValue(value)`

Type guards for categorizing MangoRange components.

## Key Design Decisions

### 1. Virtual Index Integration

Code relies on `virtual-index-middleware` to:

- Create sub-indexes automatically from compound indexes
- Handle compound key padding with MIN_KEY/MAX_KEY
- No need to manually construct virtual indexes!

**Example:**

```typescript
// User defines: index '[name+age]'
// Middleware creates: virtual 'name' index
// Code can use: schema.getIndexByKeyPath('name') ✓
```

### 2. OrderBy as Index Criterion

OrderBy is treated as extension of where clause for index matching:

```typescript
// where('name').equals('foo').orderBy('age')
// Can use: [name+age] compound index
// Range for name='foo', sorted by age automatically!
```

### 3. Limit-Based Strategy Selection

With `limit !== Infinity`, prefer orderBy index even if filtering needed:

```typescript
// where('age').above(25).orderBy('name').limit(10)
// Strategy: Iterate 'name' index, filter age, stop after 10 matches
// Why: Efficient for small limits, avoids loading all age>25 records
```

### 4. Range Merging Instead of Throwing

Overlapping ranges in `$inRanges` are merged, not rejected:

```typescript
// startsWithAnyOf(['Foo', 'F'])
// → $inRanges: [{ $gte: 'F', ... }, { $gte: 'Foo', ... }]
// Merged to: [{ $gte: 'F', $lt: 'F\uffff' }]
// User-friendly: No need to sanitize input!
```

### 5. No async/await

All code uses `.then()` chains for consistency with Dexie's Promise implementation.

## Performance Characteristics

### Best Case: O(log n + k)

- Indexed where + orderBy match
- No partial filtering
- Direct query with limit
- Example: `where('name').equals('foo').limit(10)`

### Common Case: O(log n + m + k log k)

- Indexed where, manual orderBy
- m = filtered results, k = final results after limit/offset
- Example: `where('age').above(25).orderBy('name').limit(10)`

### Worst Case: O(n)

- Full table scan with filter
- No usable index
- Example: Complex nested $and/$or without index coverage

## Future Optimization Opportunities

1. **Cost-Based Optimization**: Use statistics (cardinality, selectivity) to choose between where vs orderBy index
2. **Index Intersection**: Use multiple indexes simultaneously for $and queries
3. **Adaptive Query Planning**: Learn from execution times to adjust strategy selection
4. **Cursor Batching**: Batch cursor reads to reduce IPC overhead
5. **Range Set Optimization**: Use RangeSet data structure for complex range unions

## Testing Scenarios

Key scenarios to validate:

```typescript
// 1. Simple scan
db.friends.toArray();

// 2. Compound index usage
db.friends.where('name').equals('foo').orderBy('age').desc().toArray();

// 3. Range + orderBy without limit (prefer where)
db.friends.where('age').above(25).orderBy('name').toArray();

// 4. Range + orderBy with limit (prefer orderBy)
db.friends.where('age').above(25).orderBy('name').limit(10);

// 5. Cursor with offset
db.friends.where('age').above(25).orderBy('name').offset(10).limit(10);

// 6. Multiple ranges
db.friends
  .where('age')
  .inRanges([
    [20, 30],
    [40, 50],
  ])
  .toArray();

// 7. Complex logical
db.friends.where({ $or: [{ name: 'foo' }, { age: { $gt: 30 } }] }).toArray();
```

## Debugging Tips

1. **Check index selection**: Add logging in `findBestIndex` to see scores
2. **Trace strategy path**: Log which branch in `executeQuery` is taken
3. **Validate ranges**: Check `rangesFromMango` output for merge correctness
4. **Monitor cursor iterations**: Count `cursor.continue()` calls vs results
5. **Test with empty results**: Ensure no errors with 0 matches

## Dependencies

- `MangoExpression.ts` - Type definitions and canonicalization
- `createMangoFilter.ts` - In-memory filtering for partial expressions
- `virtual-index-middleware.ts` - Virtual index resolution (DBCore layer)
- `cmp.ts` - IndexedDB key comparison function
- `toMapKey.ts` - Convert keys to Set-friendly format

## Related Documentation

- [virtual-index-middleware.ts](../dbcore/virtual-index-middleware.ts) - How virtual indexes work
- [MangoExpression.ts](./MangoExpression.ts) - Query language specification
- [Query.ts](./Query.ts) - Query builder API
