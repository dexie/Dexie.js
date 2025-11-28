import { MangoExpression, MangoRange, SimleMangoRange } from './MangoExpression.mjs';
import { DBCoreKeyRange, DBCoreRangeType, DBCoreIndex, DBCoreTable, DBCoreTableSchema, cmp, AnyRange } from '../..';
import { toMapKey } from './toMapKey.mjs';
import { createMangoFilter } from './createMangoFilter.mjs';
import { Query, QueryPlan, SuggestedIndex, recordSuggestedIndex } from './Query.mjs';
import { Dexie } from '../..';

interface QueryContext {
  core: DBCoreTable;
  trans: any;
  schema: DBCoreTableSchema;
  query: Query;
  tableName?: string;
}

// Helper to convert a simple MangoRange (without $inRanges) to DBCoreKeyRange
function rangeFromMango(range: SimleMangoRange): DBCoreKeyRange {
  // Handle $eq
  if ('$eq' in range) {
    const keys = Object.keys(range);
    if (keys.length > 1) {
      throw new Error('$eq cannot be combined with other operators');
    }
    return {
      type: DBCoreRangeType.Equal,
      lower: range.$eq,
      upper: range.$eq,
    };
  }

  // Build range from $gt/$gte/$lt/$lte
  const hasLower = '$gt' in range || '$gte' in range;
  const hasUpper = '$lt' in range || '$lte' in range;

  if (!hasLower && !hasUpper) {
    // Empty range - return AnyRange
    return AnyRange;
  }

  const lower = '$gte' in range ? range.$gte : '$gt' in range ? range.$gt : undefined;
  const upper = '$lte' in range ? range.$lte : '$lt' in range ? range.$lt : undefined;
  const lowerOpen = '$gt' in range;
  const upperOpen = '$lt' in range;

  // Validate the range is logically correct
  if (lower !== undefined && upper !== undefined) {
    const comparison = cmp(lower, upper);
    if (comparison > 0) {
      throw new Error(`Invalid range: lower bound ${lower} is greater than upper bound ${upper}`);
    }
    if (comparison === 0 && (lowerOpen || upperOpen)) {
      throw new Error(`Invalid range: lower and upper bounds are equal but one or both are open`);
    }
  }

  return {
    type: DBCoreRangeType.Range,
    lower,
    lowerOpen,
    upper,
    upperOpen,
  };
}

// Convert MangoRange with $inRanges to array of DBCoreKeyRange
function rangesFromMango(range: MangoRange): DBCoreKeyRange[] {
  if (!('$inRanges' in range)) {
    return [rangeFromMango(range)];
  }

  const keys = Object.keys(range);
  if (keys.length > 1) {
    throw new Error('$inRanges cannot be combined with other operators');
  }

  const subRanges = range.$inRanges!;
  const dbRanges = subRanges.map(rangeFromMango); // No recursive $inRanges allowed (to keep things simple)

  // Sort ranges by lower bound
  dbRanges.sort((a, b) => {
    if (a.lower === undefined) return -1;
    if (b.lower === undefined) return 1;
    return cmp(a.lower, b.lower);
  });

  // Merge overlapping ranges
  const merged: DBCoreKeyRange[] = [];
  for (const range of dbRanges) {
    if (merged.length === 0) {
      merged.push(range);
      continue;
    }

    const prev = merged[merged.length - 1];
    
    // Check if current range overlaps or is adjacent to previous
    // Cases to merge:
    // 1. Unbounded upper in prev OR unbounded lower in current => overlap
    // 2. range.lower <= prev.upper (considering open/closed boundaries)
    
    let shouldMerge = false;
    
    if (prev.upper === undefined) {
      // Previous range is unbounded above, current is completely contained
      shouldMerge = true;
    } else if (range.lower === undefined) {
      // Current range is also unbounded below (like prev, since sorted by lower)
      // Merge and take the maximum upper bound
      shouldMerge = true;
    } else {
      const comparison = cmp(range.lower, prev.upper);
      if (comparison < 0) {
        // range.lower < prev.upper => definite overlap
        shouldMerge = true;
      } else if (comparison === 0) {
        // range.lower === prev.upper => merge if at least one boundary is closed
        // [a,b] and [b,c] should merge to [a,c]
        // [a,b) and (b,c] should NOT merge (gap at b)
        shouldMerge = !range.lowerOpen || !prev.upperOpen;
      }
    }
    
    if (shouldMerge) {
      // Merge: extend prev's upper bound if needed
      let newUpper = prev.upper;
      let newUpperOpen = prev.upperOpen;
      
      if (range.upper === undefined) {
        // Current range is unbounded above
        newUpper = undefined;
        newUpperOpen = false;
      } else if (prev.upper !== undefined) {
        const upperComparison = cmp(range.upper, prev.upper);
        if (upperComparison > 0) {
          // range.upper > prev.upper
          newUpper = range.upper;
          newUpperOpen = range.upperOpen;
        } else if (upperComparison === 0 && !range.upperOpen) {
          // Same upper bound, but current is closed => use closed
          newUpperOpen = false;
        }
      }
      
      // Replace prev with merged version
      merged[merged.length - 1] = {
        ...prev,
        upper: newUpper,
        upperOpen: newUpperOpen,
      };
    } else {
      // No overlap, add as separate range
      merged.push(range);
    }
  }

  return merged;
}

// Helper to check if a value is an equality constraint
function isEqualityValue(value: any): boolean {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return true; // Direct value
  }
  // Check if it's {$eq: ...}
  if ('$eq' in value && Object.keys(value).length === 1) {
    return true;
  }
  return false;
}

// Helper to check if a value is a range constraint
function isRangeValue(value: any): boolean {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  // Check for range operators (including $inRanges)
  return ('$gt' in value || '$gte' in value || '$lt' in value || '$lte' in value || '$inRanges' in value);
}

// Helper to get the actual value from an equality constraint
function getEqualityValue(value: any): any {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return value;
  }
  if ('$eq' in value) {
    return value.$eq;
  }
  return value;
}

// Find the best index for a given expression and optional orderBy
// Returns the index and how to use it
function findBestIndex(
  schema: DBCoreTableSchema,
  expr: MangoExpression,
  orderBy?: string[]
): {
  index: DBCoreIndex;
  equalityProps: Map<string, any>; // Props used for equality
  rangeProps: Map<string, MangoRange>; // Props used for range (max 1), may contain $inRanges
  orderByProps: string[]; // Props from orderBy that match index
  unusedProps: Map<string, any>; // Props that need manual filtering
} | null {
  if ('$and' in expr || '$or' in expr) {
    return null;
  }

  const props = Object.keys(expr);
  if (props.length === 0) return null;

  // Categorize props
  const equalityProps = new Map<string, any>();
  const rangeProps = new Map<string, MangoRange>();
  
  for (const prop of props) {
    const value = (expr as any)[prop];
    if (isEqualityValue(value)) {
      equalityProps.set(prop, getEqualityValue(value));
    } else if (isRangeValue(value)) {
      rangeProps.set(prop, value);
    } else {
      // Unknown/complex - treat as needing manual filter
      return null;
    }
  }

  // Can only have at most one range
  if (rangeProps.size > 1) {
    return null;
  }

  let bestMatch: {
    index: DBCoreIndex;
    equalityProps: Map<string, any>;
    rangeProps: Map<string, MangoRange>;
    orderByProps: string[];
    unusedProps: Map<string, any>;
    score: number;
  } | null = null;

  // Try all indexes (including primary key)
  const allIndexes = [schema.primaryKey, ...schema.indexes];
  
  for (const index of allIndexes) {
    const keyPath = index.keyPath;
    const keyPathArray = Array.isArray(keyPath) ? keyPath : keyPath === null ? [] : [keyPath];
    
    if (keyPathArray.length === 0) continue; // Skip null keyPath
    
    // Check if this is a virtual index - if so, only use the first keyLength components
    const effectiveLength = (index as any).keyLength !== undefined ? (index as any).keyLength : keyPathArray.length;
    const effectiveKeyPath = keyPathArray.slice(0, effectiveLength);
    
    // Try to match this index
    const matchedEquality = new Map<string, any>();
    const matchedRange = new Map<string, MangoRange>();
    const matchedOrderBy: string[] = [];
    let canUseIndex = true;
    let hasSeenRange = false;
    let indexPosition = 0;

    // Go through each component of the index (only effective components for virtual indexes)
    for (indexPosition = 0; indexPosition < effectiveKeyPath.length; indexPosition++) {
      const keyPathProp = effectiveKeyPath[indexPosition];
      
      // Check if this prop is in our equality constraints
      if (equalityProps.has(keyPathProp)) {
        if (hasSeenRange) {
          // Can't have equality after range
          canUseIndex = false;
          break;
        }
        matchedEquality.set(keyPathProp, equalityProps.get(keyPathProp));
        continue;
      }
      
      // Check if this prop is in our range constraints
      if (rangeProps.has(keyPathProp)) {
        if (hasSeenRange) {
          // Already have a range
          canUseIndex = false;
          break;
        }
        matchedRange.set(keyPathProp, rangeProps.get(keyPathProp)!);
        hasSeenRange = true;
        continue;
      }
      
      // Check if this prop is in orderBy
      if (orderBy && orderBy.length > 0) {
        // Check if remaining index components match orderBy in order
        let orderByIndex = 0;
        let allOrderByMatch = true;
        
        for (let i = indexPosition; i < effectiveKeyPath.length && orderByIndex < orderBy.length; i++) {
          if (effectiveKeyPath[i] === orderBy[orderByIndex]) {
            matchedOrderBy.push(orderBy[orderByIndex]);
            orderByIndex++;
          } else {
            allOrderByMatch = false;
            break;
          }
        }
        
        if (orderByIndex > 0) {
          // We matched at least some orderBy props
          // This is the end of what we can use from this index
          break;
        }
      }
      
      // This component doesn't match anything we need
      break;
    }

    if (!canUseIndex || (matchedEquality.size === 0 && matchedRange.size === 0)) {
      // Can't use this index or it doesn't help at all
      continue;
    }
    
    // Important: A non-virtual compound index cannot be used for range queries
    // unless all components before the range have equality constraints.
    // This is because IndexedDB cannot compare a single value against an array.
    // Virtual indexes handle this by translating the range appropriately.
    const isNonVirtualCompound = Array.isArray(keyPath) && keyPath.length > 1 && !(index as any).isVirtual;
    if (isNonVirtualCompound && matchedRange.size > 0) {
      // Check if we have a range without all preceding components having equality
      const rangeKeyPath = Array.from(matchedRange.keys())[0];
      const rangePosition = effectiveKeyPath.indexOf(rangeKeyPath);
      
      // For a compound index to be usable with a range:
      // - Range cannot be on the first component (position 0)
      // - Range position must equal the number of equality constraints (all before have equality)
      if (rangePosition === 0 || rangePosition !== matchedEquality.size) {
        // Range is on first component or we have a gap - can't use this compound index
        continue;
      }
    }

    // Calculate score: equality props + range props + orderBy props
    const score = matchedEquality.size + matchedRange.size + matchedOrderBy.length;
    
    // Calculate unused props
    const unusedProps = new Map<string, any>();
    equalityProps.forEach((value, key) => {
      if (!matchedEquality.has(key)) {
        unusedProps.set(key, value);
      }
    });
    rangeProps.forEach((value, key) => {
      if (!matchedRange.has(key)) {
        unusedProps.set(key, value);
      }
    });

    // Prefer simpler indexes when scores are equal (use effective length for virtual indexes)
    // Prefer real indexes over virtual indexes when they match equally well
    const currentEffectiveLength = (index as any).keyLength !== undefined ? (index as any).keyLength : keyPathArray.length;
    const bestMatchEffectiveLength = bestMatch ? 
      ((bestMatch.index as any).keyLength !== undefined ? 
        (bestMatch.index as any).keyLength : 
        (Array.isArray(bestMatch.index.keyPath) ? bestMatch.index.keyPath.length : 1)) :
      Infinity;
    
    const isCurrentVirtual = (index as any).isVirtual === true;
    const isBestMatchVirtual = bestMatch ? (bestMatch.index as any).isVirtual === true : false;
    
    const shouldReplace = !bestMatch || 
      score > bestMatch.score || 
      (score === bestMatch.score && (
        // Prefer real (non-virtual) over virtual
        (!isCurrentVirtual && isBestMatchVirtual) ||
        // If both same virtual status, prefer shorter effective length
        (isCurrentVirtual === isBestMatchVirtual && currentEffectiveLength < bestMatchEffectiveLength)
      ));
    
    if (shouldReplace) {
      bestMatch = {
        index,
        equalityProps: matchedEquality,
        rangeProps: matchedRange,
        orderByProps: matchedOrderBy,
        unusedProps,
        score,
      };
    }
  }

  return bestMatch;
}

// Build DBCoreKeyRange from equality and range props according to index keyPath
function buildRangesForIndex(
  index: DBCoreIndex,
  equalityProps: Map<string, any>,
  rangeProps: Map<string, MangoRange>
): DBCoreKeyRange[] {
  const keyPathArray = Array.isArray(index.keyPath) ? index.keyPath : [index.keyPath!];
  
  // Check if this is a virtual index - if so, only use the first keyLength components
  const effectiveLength = (index as any).keyLength !== undefined ? (index as any).keyLength : keyPathArray.length;
  const effectiveKeyPath = keyPathArray.slice(0, effectiveLength);
  
  const values: any[] = [];
  let rangeValue: MangoRange | null = null;

  for (const keyPathProp of effectiveKeyPath) {
    if (equalityProps.has(keyPathProp)) {
      values.push(equalityProps.get(keyPathProp));
    } else if (rangeProps.has(keyPathProp)) {
      rangeValue = rangeProps.get(keyPathProp)!;
      break; // Range must be last
    } else {
      break; // No more matching props
    }
  }

  if (!rangeValue) {
    // All equality - single range
    return [{
      type: DBCoreRangeType.Equal,
      lower: values.length === 1 ? values[0] : values,
      upper: values.length === 1 ? values[0] : values,
    }];
  }

  // Has a range - convert it (may contain $inRanges which expands to multiple ranges)
  const ranges = rangesFromMango(rangeValue);
  
  if (values.length === 0) {
    // Range only, no prefix
    return ranges;
  }

  // Compound key with range - prefix each range with equality values
  return ranges.map(range => ({
    ...range,
    lower: range.lower !== undefined ? [...values, range.lower] : undefined,
    upper: range.upper !== undefined ? [...values, range.upper] : undefined,
  }));
}

// Analyze MangoExpression for indexability with optional orderBy
function analyzeForIndex(
  schema: DBCoreTableSchema,
  expr: MangoExpression,
  orderBy?: string[]
): { 
  index: DBCoreIndex; 
  ranges: DBCoreKeyRange[]; 
  partial?: MangoExpression;
  orderByMatched: boolean; // true if orderBy is fully satisfied by index
} | null {
  if ('$and' in expr || '$or' in expr) {
    return null; // Complex expressions handled recursively
  }

  const bestMatch = findBestIndex(schema, expr, orderBy);
  if (!bestMatch) {
    return null;
  }

  const { index, equalityProps, rangeProps, orderByProps, unusedProps } = bestMatch;

  // Build ranges
  const ranges = buildRangesForIndex(index, equalityProps, rangeProps);

  // Build partial expression if needed
  let partial: MangoExpression | undefined;
  if (unusedProps.size > 0) {
    partial = {};
    unusedProps.forEach((value, key) => {
      (partial as any)[key] = value;
    });
  }

  // Check if orderBy is fully matched
  const orderByMatched = orderBy ? orderByProps.length === orderBy.length : true;

  return {
    index,
    ranges,
    partial,
    orderByMatched,
  };
}

// Execute keys-only query for a single index + ranges, with optional partial filtering
function executeKeysQuery(
  ctx: QueryContext,
  index: DBCoreIndex,
  ranges: DBCoreKeyRange[],
  partialFilter?: MangoExpression
): Promise<Set<string | number>> {
  const { core, trans, schema } = ctx;
  
  if (ranges.length === 1) {
    return core.query({
      trans,
      values: partialFilter ? true : false,
      query: { index, range: ranges[0] },
    }).then(res => {
      if (partialFilter) {
        const filter = createMangoFilter(partialFilter);
        const filtered = res.result.filter(filter);
        return new Set(
          filtered.map((obj: any) => toMapKey(schema.primaryKey.extractKey!(obj)))
        );
      }
      return new Set(res.result.map(toMapKey));
    });
  }

  // Multiple ranges - execute in parallel
  return Promise.all(
    ranges.map(range => 
      core.query({
        trans,
        values: partialFilter ? true : false,
        query: { index, range },
      })
    )
  ).then(results => {
    const keySet = new Set<string | number>();
    
    if (partialFilter) {
      const filter = createMangoFilter(partialFilter);
      results.forEach(res => {
        const filtered = res.result.filter(filter);
        filtered.forEach((obj: any) => {
          keySet.add(toMapKey(schema.primaryKey.extractKey!(obj)));
        });
      });
    } else {
      results.forEach(res => {
        res.result.forEach((key: any) => keySet.add(toMapKey(key)));
      });
    }
    
    return keySet;
  });
}

// Execute query for $or expression
function executeOrQuery(
  ctx: QueryContext,
  orBranches: MangoExpression[],
  orderBy?: string[]
): Promise<Set<string | number>> {
  const promises = orBranches.map(branch => executeMangoQuery(ctx, branch, orderBy));
  
  return Promise.all(promises).then(keySets => {
    // Union of all keys
    const unionKeys = new Set<string | number>();
    keySets.forEach(keySet => {
      keySet.forEach(key => unionKeys.add(key));
    });
    return unionKeys;
  });
}

// Execute query for $and expression
function executeAndQuery(
  ctx: QueryContext,
  andBranches: MangoExpression[],
  orderBy?: string[]
): Promise<Set<string | number>> {
  const promises = andBranches.map(branch => executeMangoQuery(ctx, branch, orderBy));
  
  return Promise.all(promises).then(keySets => {
    // Intersect all key sets
    if (keySets.length === 0) {
      return new Set<string | number>();
    }
    
    return keySets.reduce((acc, keySet) => {
      const result = new Set<string | number>();
      acc.forEach(key => {
        if (keySet.has(key)) result.add(key);
      });
      return result;
    });
  });
}

// Main recursive query executor - returns keys only
function executeMangoQuery(
  ctx: QueryContext,
  expr: MangoExpression,
  orderBy?: string[]
): Promise<Set<string | number>> {
  const { core, trans, schema } = ctx;

  // Handle $or
  if ('$or' in expr) {
    return executeOrQuery(ctx, expr.$or, orderBy);
  }

  // Handle $and
  if ('$and' in expr) {
    return executeAndQuery(ctx, expr.$and, orderBy);
  }

  // Try to use index
  const analysis = analyzeForIndex(schema, expr, orderBy);
  if (analysis) {
    return executeKeysQuery(ctx, analysis.index, analysis.ranges, analysis.partial);
  }

  // Not indexable - full scan with filter
  return core.query({
    trans,
    values: true,
    query: {
      index: schema.primaryKey,
      range: AnyRange,
    },
  }).then(res => {
    const filter = createMangoFilter(expr);
    const filtered = res.result.filter(filter);
    return new Set(
      filtered.map((obj: any) => toMapKey(schema.primaryKey.extractKey!(obj)))
    );
  });
}

// Helper to sort results in memory when no suitable index exists
function sortResults(results: any[], orderBy: string[], direction: 'asc' | 'desc', schema: DBCoreTableSchema): any[] {
  const { getByKeyPath } = Dexie;
  
  // Add primary key to orderBy if not already present (IndexedDB does this implicitly)
  const pkKeyPath = schema.primaryKey.keyPath;
  const pkArray = Array.isArray(pkKeyPath) ? pkKeyPath : pkKeyPath === null ? [] : [pkKeyPath];
  const effectiveOrderBy = [...orderBy];
  
  if (pkArray.length > 0) {
    // Check if primary key is already at the end
    const hasPkAtEnd = pkArray.every((pk, i) => {
      const idx = effectiveOrderBy.length - pkArray.length + i;
      return idx >= 0 && effectiveOrderBy[idx] === pk;
    });
    
    if (!hasPkAtEnd) {
      // Add primary key components at the end
      effectiveOrderBy.push(...pkArray);
    }
  }
  
  return results.sort((a, b) => {
    for (const keyPath of effectiveOrderBy) {
      const aVal = getByKeyPath(a, keyPath);
      const bVal = getByKeyPath(b, keyPath);
      const comparison = cmp(aVal, bVal);
      if (comparison !== 0) {
        return direction === 'desc' ? -comparison : comparison;
      }
    }
    return 0;
  });
}

// Execute query using cursor iteration with filtering (for offset+filter or limit+filter scenarios)
function executeWithCursor(
  core: DBCoreTable,
  trans: any,
  index: DBCoreIndex,
  range: DBCoreKeyRange,
  direction: 'next' | 'prev',
  filter: ((obj: any) => boolean) | null,
  offset: number,
  limit: number
): Promise<any[]> {
  const results: any[] = [];
  let skipped = 0;
  let collected = 0;

  return core.openCursor({
    trans,
    values: true,
    query: { index, range },
    reverse: direction === 'prev',
  }).then(cursor => {
    if (!cursor) return results;

    return cursor.start(function iterate() {
      // Check if value passes filter
      const passes = filter ? filter(cursor.value) : true;
      
      if (passes) {
        if (skipped < offset) {
          // Still skipping
          skipped++;
        } else if (limit === Infinity || collected < limit) {
          // Collect this result
          results.push(cursor.value);
          collected++;
          
          // Check if we're done
          if (limit !== Infinity && collected >= limit) {
            cursor.stop(results);
            return;
          }
        }
      }
      
      // Continue to next
      cursor.continue();
    }).then(() => results);
  });
}

// Count query execution
export function executeCount(ctx: QueryContext): Promise<number> {
  const { core, trans, schema, query } = ctx;
  const { where, offset, limit } = query;

  // Helper to apply offset/limit to a count
  const applyOffsetLimit = (count: number): number => {
    let result = count;
    if (offset > 0) {
      result = Math.max(0, result - offset);
    }
    return Math.min(result, limit);
  };

  // Case 1: No where clause - count everything
  if (!where) {
    return core.count({ trans, query: { index: schema.primaryKey, range: AnyRange } })
      .then(count => applyOffsetLimit(count));
  }

  // Case 2: Simple where clause (no $and/$or)
  const isSimpleWhere = !('$and' in where) && !('$or' in where);
  
  if (isSimpleWhere) {
    // Analyze where clause
    const whereAnalysis = analyzeForIndex(schema, where);
    
    if (whereAnalysis && !whereAnalysis.partial) {
      // Pure index query - can use core.count()
      const { index, ranges } = whereAnalysis;
      
      if (ranges.length === 1) {
        // Single range - direct count
        return core.count({ trans, query: { index, range: ranges[0] } })
          .then(count => applyOffsetLimit(count));
      }
      
      // Multiple ranges ($inRanges) - count each and sum
      return Promise.all(
        ranges.map(range =>
          core.count({ trans, query: { index, range } })
        )
      ).then(counts => {
        const total = counts.reduce((sum, count) => sum + count, 0);
        return applyOffsetLimit(total);
      });
    }
  }

  // Case 3: Complex query or needs filtering - execute and count
  // We need to pass offset/limit to executeQuery to get accurate count
  return executeQuery(ctx).then(results => (results as any[]).length);
}

// Helper to check if an index already exists
function indexExists(schema: DBCoreTableSchema, keyPath: string | string[]): boolean {
  // Use the built-in getIndexByKeyPath which handles virtual indexes and keyPath aliases
  return schema.getIndexByKeyPath(keyPath) != null;
}

// Helper to analyze and suggest missing indexes
function analyzeSuggestedIndexes(
  ctx: QueryContext,
  where: MangoExpression | null,
  orderBy: string[],
  currentIndex: DBCoreIndex | null,
  needsManualSort: boolean,
  needsFiltering: boolean
): SuggestedIndex[] {
  const { schema, tableName } = ctx;
  const suggestions: SuggestedIndex[] = [];
  
  if (!tableName) return suggestions;

  // Priority levels:
  // 10: Critical - full table scan with filtering
  // 8: High - manual sort on large result set
  // 7: High - compound index could cover where + orderBy
  // 6: Medium - partial index coverage
  
  // Case 1: No usable index for where clause (full scan) OR complex query needs indexes
  if (where && (!currentIndex || '$and' in where)) {
    const props = Object.keys(where);
    if (props.length > 0 && !('$and' in where) && !('$or' in where)) {
      const firstProp = props[0];
      if (!indexExists(schema, firstProp)) {
        suggestions.push({
          keyPath: firstProp,
          reason: 'Full table scan - no index available for where clause',
          priority: 10,
        });
        recordSuggestedIndex(tableName, firstProp, 10, 'Full table scan - no index available for where clause');
      }
    } else if ('$and' in where) {
      // For $and queries, check if ANY condition has an index
      const andClauses = (where as any).$and as MangoExpression[];
      const propsWithoutIndex: string[] = [];
      const propsWithIndex: string[] = [];
      
      andClauses.forEach((clause: MangoExpression) => {
        const clauseProps = Object.keys(clause).filter(k => k !== '$and' && k !== '$or');
        clauseProps.forEach(prop => {
          if (!indexExists(schema, prop)) {
            propsWithoutIndex.push(prop);
          } else {
            propsWithIndex.push(prop);
          }
        });
      });
      
      // Only suggest if NO conditions have indexes (full scan scenario)
      // If some conditions already have indexes, those can be used for filtering
      if (propsWithIndex.length === 0 && propsWithoutIndex.length > 0) {
        propsWithoutIndex.forEach(prop => {
          suggestions.push({
            keyPath: prop,
            reason: 'Complex query with no available indexes - full scan required',
            priority: 9,
          });
          recordSuggestedIndex(tableName, prop, 9, 'Complex query with no available indexes - full scan required');
        });
      }
    }
  }
  
  // Case 2: Manual sort needed (no orderBy index)
  if (needsManualSort && orderBy.length > 0) {
    const orderByKey = orderBy.length === 1 ? orderBy[0] : orderBy;
    
    // Only suggest if index doesn't exist
    if (!indexExists(schema, orderByKey)) {
      suggestions.push({
        keyPath: orderByKey,
        reason: 'Manual in-memory sort required',
        priority: 8,
      });
      recordSuggestedIndex(tableName, orderByKey, 8, 'Manual in-memory sort required');
    }
  }
  
  // Case 3: Compound index could cover where + orderBy
  // BUT: Only if where uses equality (not ranges) on all components before orderBy
  // This is because IndexedDB can only use subsequent index components for ordering
  // if all previous components are exact matches (not ranges)
  if (where && orderBy.length > 0 && currentIndex && needsManualSort) {
    const whereProps = Object.keys(where).filter(k => k !== '$and' && k !== '$or');
    
    if (whereProps.length > 0) {
      // Check if all where conditions are equality (not ranges)
      let allEquality = true;
      for (const prop of whereProps) {
        const value = (where as any)[prop];
        // Check if it's a range operator
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          if ('$gt' in value || '$gte' in value || '$lt' in value || '$lte' in value || '$inRanges' in value) {
            allEquality = false;
            break;
          }
        }
      }
      
      // Only suggest compound index if all where conditions are equality
      if (allEquality) {
        const compoundKeyPath = [...whereProps, ...orderBy];
        
        if (!indexExists(schema, compoundKeyPath)) {
          suggestions.push({
            keyPath: compoundKeyPath,
            reason: 'Compound index would cover both where (equality) and orderBy',
            priority: 7,
          });
          recordSuggestedIndex(tableName, compoundKeyPath, 7, 'Compound index would cover both where (equality) and orderBy');
        }
      }
    }
  }
  
  // Case 4: Manual filtering needed (partial index coverage)
  if (needsFiltering && where) {
    const props = Object.keys(where);
    const uncoveredProps: string[] = [];
    
    if (!('$and' in where) && !('$or' in where)) {
      const currentKeyPath = currentIndex?.keyPath;
      const currentKeyPathArray = Array.isArray(currentKeyPath) ? currentKeyPath : currentKeyPath ? [currentKeyPath] : [];
      
      props.forEach(prop => {
        if (!currentKeyPathArray.includes(prop)) {
          uncoveredProps.push(prop);
        }
      });
      
      if (uncoveredProps.length > 0) {
        // Suggest compound index that covers all props
        const suggestedKeyPath = [...currentKeyPathArray.filter(kp => props.includes(kp)), ...uncoveredProps];
        if (suggestedKeyPath.length > 1 && !indexExists(schema, suggestedKeyPath)) {
          suggestions.push({
            keyPath: suggestedKeyPath,
            reason: 'Compound index would eliminate manual filtering',
            priority: 6,
          });
          recordSuggestedIndex(tableName, suggestedKeyPath, 6, 'Compound index would eliminate manual filtering');
        }
      }
    }
  }
  
  return suggestions;
}

// Helper to build query plan
function buildQueryPlan(
  strategy: string,
  index: DBCoreIndex | null,
  ranges?: DBCoreKeyRange[],
  options?: {
    where?: MangoExpression;
    orderBy?: string[];
    direction?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
    filtering?: { indexCovered: string[]; manualFilter: MangoExpression };
    cursorBased?: boolean;
    complexity?: string;
    notes?: string[];
    suggestedIndexes?: SuggestedIndex[];
  }
): QueryPlan {
  const plan: QueryPlan = {
    strategy,
    index: index
      ? {
          name: index.name ?? ':id', // Use ":id" alias for primary key (matches getKeyPathAlias)
          keyPath: index.keyPath!,
          compound: Array.isArray(index.keyPath) && index.keyPath.length > 1,
        }
      : null,
  };

  if (ranges && ranges.length > 0) {
    plan.ranges = ranges.map((r) => ({
      type: r.type === DBCoreRangeType.Equal ? 'Equal' : 'Range',
      lower: r.lower,
      upper: r.upper,
      lowerOpen: r.lowerOpen,
      upperOpen: r.upperOpen,
    }));
  }

  if (options) {
    if (options.where) plan.where = options.where;
    if (options.orderBy && options.orderBy.length > 0) plan.orderBy = options.orderBy;
    if (options.direction) plan.direction = options.direction;
    if (options.limit !== undefined && options.limit !== Infinity) plan.limit = options.limit;
    if (options.offset) plan.offset = options.offset;
    if (options.filtering) plan.filtering = options.filtering;
    if (options.cursorBased) plan.cursorBased = options.cursorBased;
    if (options.complexity) plan.estimatedComplexity = options.complexity;
    if (options.notes && options.notes.length > 0) plan.notes = options.notes;
    if (options.suggestedIndexes && options.suggestedIndexes.length > 0) {
      plan.suggestedIndexes = options.suggestedIndexes;
    }
  }

  return plan;
}

// Main entry point
export function executeQuery(ctx: QueryContext): Promise<ReadonlyArray<any> | QueryPlan> {
  const { core, trans, schema, query } = ctx;
  const { where, orderBy, limit, offset, direction, explain } = query;
  
  // Convert direction to DBCore format
  const dbDirection = direction === 'desc' ? 'prev' : 'next';

  // Case 1: Simple toArray() - no where, no orderBy, no offset
  if (!where && orderBy.length === 0 && offset === 0) {
    if (explain) {
      return Promise.resolve(
        buildQueryPlan('Full table scan', schema.primaryKey, [AnyRange], {
          limit,
          complexity: 'O(n)',
          notes: ['No filters or ordering specified', 'Scanning primary key'],
        })
      );
    }
    return core.query({
      trans,
      values: true,
      query: {
        index: schema.primaryKey,
        range: AnyRange,
      },
      limit: limit === Infinity ? undefined : limit,
    }).then(res => res.result);
  }

  // Find orderBy index using virtual index middleware
  let orderByIndex: DBCoreIndex | undefined;
  
  if (orderBy.length > 0) {
    // schema.getIndexByKeyPath handles virtual indexes
    const orderByKey = orderBy.length === 1 ? orderBy[0] : orderBy;
    orderByIndex = schema.getIndexByKeyPath(orderByKey);
  }

  // If no where clause, just use orderBy
  if (!where) {
    const queryIndex = orderByIndex || schema.primaryKey;
    const needsManualSort = orderBy.length > 0 && !orderByIndex;
    
    // Analyze and record suggested indexes
    const suggestions = analyzeSuggestedIndexes(ctx, null, orderBy, queryIndex, needsManualSort, false);
    
    if (explain) {
      const notes: string[] = [];
      let complexity = 'O(n)';
      
      if (needsManualSort) {
        notes.push('No matching index for orderBy, will sort in memory');
        if (offset > 0 || limit !== Infinity) {
          notes.push('Loading all records for manual sort with offset/limit');
          complexity = 'O(n log n)';
        }
      } else if (orderByIndex) {
        notes.push('Using orderBy index for natural ordering');
        complexity = 'O(log n + k)';
      }
      
      return Promise.resolve(
        buildQueryPlan(
          needsManualSort ? 'Scan + manual sort' : 'Index scan',
          queryIndex,
          [AnyRange],
          {
            orderBy,
            direction,
            limit,
            offset,
            complexity,
            notes,
            suggestedIndexes: suggestions,
          }
        )
      );
    }
    
    // If we need manual sort and have offset, we MUST load everything
    // Otherwise we can optimize with limit
    if (needsManualSort && (offset > 0 || limit !== Infinity)) {
      return core.query({
        trans,
        values: true,
        query: {
          index: schema.primaryKey,
          range: AnyRange,
        },
      }).then(res => {
        const sorted = sortResults(res.result, orderBy, direction, schema);
        return sorted.slice(offset, offset + limit);
      });
    }
    
    return core.query({
      trans,
      values: true,
      query: {
        index: queryIndex,
        range: AnyRange,
      },
      direction: dbDirection,
      limit: limit === Infinity ? undefined : limit + offset,
    }).then(res => {
      let results = res.result;
      
      // If orderBy was requested but no suitable index found, sort in memory
      if (needsManualSort) {
        results = sortResults(results, orderBy, direction, schema);
      }
      
      return results.slice(offset);
    });
  }

  // Check if where clause is simple (no $and/$or)
  const isSimpleWhere = !('$and' in where) && !('$or' in where);
  
  if (isSimpleWhere) {
    // Analyze where clause for index usage
    const whereAnalysis = analyzeForIndex(schema, where, orderBy);
    
    if (whereAnalysis) {
      const { index, ranges, partial, orderByMatched } = whereAnalysis;
      const needsFiltering = !!partial;
      const needsManualSort = orderBy.length > 0 && !orderByMatched;
      
      // Analyze and record suggested indexes
      const suggestions = analyzeSuggestedIndexes(ctx, where, orderBy, index, needsManualSort, needsFiltering);
      
      // Handle explain mode
      if (explain) {
        const notes: string[] = [];
        let strategy = 'Index scan';
        let complexity = 'O(log n + k)';
        let cursorBased = false;
        let explainIndex = index; // Default to where index
        
        // Determine actual strategy
        if (orderByMatched && !needsFiltering) {
          strategy = 'Direct index query (fast path)';
          notes.push('Index covers both where and orderBy');
          notes.push('No additional filtering needed');
          if (ranges.length > 1) {
            notes.push(`Using ${ranges.length} ranges (from $inRanges)`);
          }
        } else if (orderBy.length > 0 && orderByIndex && limit !== Infinity) {
          strategy = 'OrderBy index with filtering';
          explainIndex = orderByIndex; // Use orderBy index for this strategy
          cursorBased = true; // Always use cursor when filtering manually
          notes.push('Using cursor iteration for efficient limit with filtering');
          notes.push('Filtering on where clause manually');
          complexity = 'O(log n + m)';
        } else {
          strategy = 'Where index scan';
          if (needsFiltering) {
            notes.push('Partial filtering needed after index scan');
          }
          if (orderBy.length > 0 && !orderByMatched) {
            notes.push('Manual sort needed - orderBy not covered by index');
            complexity = 'O(log n + k log k)';
          }
          if (ranges.length > 1) {
            notes.push(`Querying ${ranges.length} ranges in parallel`);
          }
        }
        
        const indexCovered: string[] = [];
        const keyPathArray = Array.isArray(explainIndex.keyPath) ? explainIndex.keyPath : [explainIndex.keyPath!];
        keyPathArray.forEach(kp => {
          if ((where as any)[kp] !== undefined) {
            indexCovered.push(kp);
          }
        });
        
        return Promise.resolve(
          buildQueryPlan(strategy, explainIndex, ranges, {
            where,
            orderBy,
            direction,
            limit,
            offset,
            filtering: needsFiltering
              ? {
                  indexCovered,
                  manualFilter: partial!,
                }
              : undefined,
            cursorBased,
            complexity,
            notes,
            suggestedIndexes: suggestions,
          })
        );
      }
      
      // STRATEGY DECISION:
      // 1. If orderBy is matched AND no filtering needed => Direct query (fast path)
      // 2. If we have limit+filtering OR offset+filtering => Use cursor iteration
      // 3. If we have orderBy but not matched => Need to decide based on cost
      
      if (orderByMatched && !needsFiltering) {
        // FAST PATH: Index covers both where and orderBy, no extra filtering
        if (ranges.length === 1) {
          return core.query({
            trans,
            values: true,
            query: { index, range: ranges[0] },
            direction: dbDirection,
            limit: limit === Infinity ? undefined : limit + offset,
          }).then(res => res.result.slice(offset));
        }
        
        // Multiple ranges - query in parallel and merge
        return Promise.all(
          ranges.map(range =>
            core.query({
              trans,
              values: true,
              query: { index, range },
              direction: dbDirection,
            })
          )
        ).then(results => {
          let merged: any[] = [];
          results.forEach(res => {
            merged = merged.concat(res.result);
          });
          
          // Multiple ranges need sorting
          merged = sortResults(merged, orderBy, direction, schema);
          return merged.slice(offset, limit === Infinity ? undefined : offset + limit);
        });
      }
      
      // We need filtering and/or ordering isn't matched by where index
      // Decide strategy based on whether we have orderBy
      
      if (orderBy.length > 0 && orderByIndex && limit !== Infinity) {
        // Use orderBy index + filter where manually
        // This is efficient when limit is small relative to dataset
        // BUT: Only do this when we have a limit! Otherwise use where index.
        const filter = createMangoFilter(where);
        
        if (offset > 0 || needsFiltering) {
          // MUST use cursor iteration to avoid loading everything
          return executeWithCursor(
            core,
            trans,
            orderByIndex,
            AnyRange,
            dbDirection,
            filter,
            offset,
            limit
          );
        }
        
        // No offset, can use query + filter
        return core.query({
          trans,
          values: true,
          query: { index: orderByIndex, range: AnyRange },
          direction: dbDirection,
        }).then(res => {
          const filtered = res.result.filter(filter);
          return filtered.slice(0, limit === Infinity ? undefined : limit);
        });
      }
      
      // Use where index + manual sort if needed
      if (ranges.length === 1) {
        // Decide: cursor vs query based on filtering + limit
        if (needsFiltering && (limit !== Infinity || offset > 0)) {
          // Use cursor to avoid loading too much
          const filter = partial ? createMangoFilter(partial) : null;
          return executeWithCursor(
            core,
            trans,
            index,
            ranges[0],
            dbDirection,
            filter,
            offset,
            limit
          ).then(results => {
            // Apply manual sort if orderBy requested but not matched
            if (orderBy.length > 0 && !orderByMatched) {
              return sortResults(results, orderBy, direction, schema);
            }
            return results;
          });
        }
        
        // Query all and filter + sort
        return core.query({
          trans,
          values: true,
          query: { index, range: ranges[0] },
          direction: dbDirection,
        }).then(res => {
          let results = res.result;
          
          if (needsFiltering) {
            const filter = createMangoFilter(partial!);
            results = results.filter(filter);
          }
          
          if (orderBy.length > 0 && !orderByMatched) {
            results = sortResults(results, orderBy, direction, schema);
          }
          
          return results.slice(offset, offset + limit);
        });
      }
      
      // Multiple ranges - always load and process
      return Promise.all(
        ranges.map(range =>
          core.query({
            trans,
            values: true,
            query: { index, range },
            direction: dbDirection,
          })
        )
      ).then(results => {
        let merged: any[] = [];
        results.forEach(res => {
          merged = merged.concat(res.result);
        });
        
        if (needsFiltering) {
          const filter = createMangoFilter(partial!);
          merged = merged.filter(filter);
        }
        
        if (orderBy.length > 0) {
          merged = sortResults(merged, orderBy, direction, schema);
        }
        
        return merged.slice(offset, offset + limit);
      });
    }
    
    // No index available for simple where - need full scan with filtering
    const filter = createMangoFilter(where);
    const suggestions = analyzeSuggestedIndexes(ctx, where, orderBy, null, orderBy.length > 0 && !orderByIndex, true);
    
    if (explain) {
      return Promise.resolve(
        buildQueryPlan('Full table scan with filtering', orderByIndex || schema.primaryKey, [AnyRange], {
          where,
          orderBy,
          direction,
          limit,
          offset,
          complexity: orderBy.length > 0 ? 'O(n log n)' : 'O(n)',
          notes: [
            'No index available for where clause',
            'Full table scan required',
            'Filtering all records manually',
            orderBy.length > 0 ? 'Manual sort needed' : ''
          ].filter(Boolean),
          suggestedIndexes: suggestions,
        })
      );
    }
    
    return core.query({
      trans,
      values: true,
      query: {
        index: orderByIndex || schema.primaryKey,
        range: AnyRange,
      },
      direction: dbDirection,
    }).then(res => {
      let results = res.result.filter(filter);
      
      if (orderBy.length > 0) {
        results = sortResults(results, orderBy, direction, schema);
      }
      
      return results.slice(offset, offset + limit);
    });
  }

  // Complex query with $and/$or: Execute recursively to get matching keys
  const needsManualSortForComplex = orderBy.length > 0 && !orderByIndex;
  const suggestionsForComplex = analyzeSuggestedIndexes(
    ctx, 
    where, 
    orderBy, 
    null, // No index used for where clause in complex queries
    needsManualSortForComplex, 
    true // Complex queries always involve filtering
  );
  
  if (explain) {
    const notes: string[] = [];
    let strategy = 'Complex query (recursive)';
    let complexity = 'O(n)';
    let cursorBased = false;
    let explainIndex = orderByIndex || schema.primaryKey;
    
    // Check if we can use orderBy index with cursor iteration (more efficient with limit/offset)
    if (orderBy.length > 0 && orderByIndex && (limit !== Infinity || offset > 0)) {
      strategy = 'OrderBy index with filtering';
      cursorBased = true;
      complexity = 'O(n) worst case, O(log n + m) average';
      notes.push('Complex query with multiple conditions');
      notes.push('Using cursor iteration for efficient limit/offset with filtering');
      notes.push('Filtering all where conditions manually during iteration');
      notes.push('m = number of records scanned until limit reached (best case: m ≈ limit)');
    } else {
      notes.push('Complex query with $and/$or operators');
      notes.push('Using recursive key extraction strategy');
      if (orderBy.length > 0 && !orderByIndex) {
        notes.push('Manual sort needed after key extraction');
      }
    }
    
    return Promise.resolve(
      buildQueryPlan(strategy, explainIndex, undefined, {
        where,
        orderBy,
        direction,
        limit,
        offset,
        complexity,
        cursorBased,
        notes,
        suggestedIndexes: suggestionsForComplex,
      })
    );
  }
  
  return executeMangoQuery(ctx, where, orderBy).then(matchingKeys => {
    if (matchingKeys.size === 0) {
      return [];
    }

    // Use orderBy index if available, otherwise primary key
    const queryIndex = orderByIndex || schema.primaryKey;
    const needsManualSort = orderBy.length > 0 && !orderByIndex;

    // Get all keys in index order
    return core.query({
      trans,
      values: false,
      query: {
        index: queryIndex,
        range: AnyRange,
      },
      direction: dbDirection,
    }).then(orderedKeysResult => {
      // Filter by matching keys
      const filteredKeys = orderedKeysResult.result.filter((key: any) =>
        matchingKeys.has(toMapKey(key))
      );

      // Apply offset and limit
      const selectedKeys = filteredKeys.slice(
        offset,
        offset + limit
      );

      // Get values
      return core.getMany({ trans, keys: selectedKeys }).then(values => {
        if (needsManualSort) {
          return sortResults(values, orderBy, direction, schema);
        }
        return values;
      });
    });
  });
}
