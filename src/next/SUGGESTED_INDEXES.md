# Suggested Indexes Feature

## Overview

The Next Generation Dexie API includes an intelligent index advisor that tracks query patterns and suggests optimal indexes to improve performance. This feature works both with `explain()` for detailed query analysis and through a global tracking system that monitors all queries.

## Usage

### 1. Query Analysis with `explain()`

Use `explain()` instead of `toArray()` to get a detailed execution plan including suggested indexes:

```typescript
const plan = await db.friends
  .where("age").above(30)
  .orderBy("name")
  .explain();

console.log(plan);
// {
//   strategy: "Where index scan",
//   index: { name: "age", keyPath: "age", compound: false },
//   estimatedComplexity: "O(log n + k log k)",
//   notes: ["Manual sort needed - orderBy not covered by index"],
//   suggestedIndexes: [
//     {
//       keyPath: ["age", "name"],
//       reason: "Compound index would cover both where and orderBy",
//       priority: 7
//     }
//   ]
// }
```

### 2. Global Index Tracking

All queries (including `toArray()`, `count()`, etc.) automatically record suggested indexes in a global registry:

```typescript
import { getSuggestedIndexes, clearSuggestedIndexes } from 'dexie/next';

// Run your application normally
await db.friends.orderBy("shoeSize").toArray();
await db.friends.where("age").above(30).orderBy("name").toArray();

// Get collected suggestions
const suggestions = getSuggestedIndexes();
console.log(suggestions);
// [
//   {
//     table: "friends",
//     keyPath: ["age", "name"],
//     priority: 7,
//     reason: "Compound index would cover both where and orderBy"
//   },
//   {
//     table: "friends", 
//     keyPath: "shoeSize",
//     priority: 8,
//     reason: "Manual in-memory sort required"
//   }
// ]

// Clear suggestions to start fresh
clearSuggestedIndexes();
```

## Priority Levels

Suggestions are prioritized from 1-10, with higher numbers being more important:

- **10 (Critical)**: Full table scan with filtering - no index available
- **8 (High)**: Manual in-memory sort required
- **7 (High)**: Compound index could cover both where and orderBy
- **6 (Medium)**: Partial index coverage - compound index would eliminate manual filtering
- **4 (Low)**: General optimization opportunity

## Implementation Guide

### Development Workflow

1. **Enable tracking during development:**
   ```typescript
   clearSuggestedIndexes(); // Start fresh
   ```

2. **Run through typical user flows** - the system will track all queries

3. **Analyze suggestions:**
   ```typescript
   const suggestions = getSuggestedIndexes();
   suggestions.forEach(s => {
     console.log(`[${s.priority}] ${s.table}.${Array.isArray(s.keyPath) ? s.keyPath.join('+') : s.keyPath}`);
     console.log(`    Reason: ${s.reason}`);
   });
   ```

4. **Update your schema:**
   ```typescript
   db.version(2).stores({
     friends: '++id,name,age,shoeSize,[age+name]' // Added compound index
   });
   ```

### Production Monitoring

```typescript
// Collect suggestions in production (with sampling)
let queryCount = 0;
const SAMPLE_RATE = 0.01; // Sample 1% of queries

// After each query (pseudo-code)
if (Math.random() < SAMPLE_RATE) {
  const suggestions = getSuggestedIndexes();
  if (suggestions.length > 0) {
    analytics.track('suggested_indexes', { suggestions });
  }
}
```

## Query Plan Structure

The `QueryPlan` object returned by `explain()` contains:

```typescript
interface QueryPlan {
  strategy: string;                    // Execution strategy used
  index: {                             // Index being used
    name: string;
    keyPath: string | string[];
    compound: boolean;
  } | null;
  ranges?: Array<{...}>;               // Index ranges queried
  where?: MangoExpression;             // Where clause
  orderBy?: string[];                  // Sort keys
  direction?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  filtering?: {                        // Manual filtering info
    indexCovered: string[];
    manualFilter: MangoExpression;
  };
  cursorBased?: boolean;               // Using cursor iteration
  estimatedComplexity?: string;        // Big-O notation
  notes?: string[];                    // Human-readable explanations
  suggestedIndexes?: SuggestedIndex[]; // Missing index suggestions
}
```

## Best Practices

### 1. Review High-Priority Suggestions First

Focus on priority 7+ suggestions as they have the most impact:

```typescript
const critical = getSuggestedIndexes().filter(s => s.priority >= 7);
```

### 2. Validate Before Adding Indexes

Not all suggestions are worth implementing:
- Consider query frequency
- Evaluate index size impact
- Test performance improvements

### 3. Use Compound Indexes Strategically

Compound indexes work best when:
- Queries use the prefix (leftmost) columns
- Sort order matches query patterns
- Write performance impact is acceptable

### 4. Monitor Index Usage

After adding indexes, verify they're being used:

```typescript
const plan = await db.friends.where("age").above(30).orderBy("name").explain();
console.log(plan.index); // Should show your new compound index
console.log(plan.suggestedIndexes); // Should be empty or have lower priority items
```

## Examples

### Example 1: Missing OrderBy Index

```typescript
// Query
await db.friends.orderBy("shoeSize").toArray();

// Suggestion
{
  keyPath: "shoeSize",
  priority: 8,
  reason: "Manual in-memory sort required"
}

// Solution
db.version(2).stores({
  friends: '++id,name,age,shoeSize' // Added shoeSize index
});
```

### Example 2: Suboptimal Compound Index

```typescript
// Query
await db.friends.where("age").above(30).orderBy("name").toArray();

// Suggestion
{
  keyPath: ["age", "name"],
  priority: 7,
  reason: "Compound index would cover both where and orderBy"
}

// Solution
db.version(2).stores({
  friends: '++id,name,age,[age+name]' // Added compound index
});
```

### Example 3: Missing Where Index

```typescript
// Query
await db.users.where("email").equals("test@example.com").toArray();

// Suggestion (if email is not indexed)
{
  keyPath: "email",
  priority: 10,
  reason: "Full table scan - no index available for where clause"
}

// Solution
db.version(2).stores({
  users: '++id,email,name' // Added email index
});
```

## API Reference

### `explain(): Promise<QueryPlan>`

Returns detailed query execution plan including suggested indexes.

### `getSuggestedIndexes(): Array<{table, keyPath, priority, reason}>`

Returns all collected suggestions, sorted by priority (descending).

### `clearSuggestedIndexes(): void`

Clears the global suggestion registry.

### `recordSuggestedIndex(table, keyPath, priority, reason): void`

Manually record a suggested index (advanced usage only).

## Technical Details

- Suggestions are deduplicated per table+keyPath combination
- Higher priority suggestions override lower ones for the same index
- Suggestions persist until `clearSuggestedIndexes()` is called
- `explain()` mode does NOT execute the query, only analyzes it
- Non-explain queries DO execute and also record suggestions
