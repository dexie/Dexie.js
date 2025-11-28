import { MangoExpression } from './MangoExpression.mjs';

export class Query {
  where: MangoExpression | null;
  limit: number;
  offset: number;
  orderBy: string[];
  direction: 'asc' | 'desc';
  explain: boolean;

  constructor() {
    this.where = null;
    this.limit = Infinity;
    this.offset = 0;
    this.orderBy = [];
    this.direction = 'asc';
    this.explain = false;
  }
}

export interface SuggestedIndex {
  keyPath: string | string[];
  reason: string;
  priority: number; // 1-10, higher = more important
}

export interface QueryPlan {
  strategy: string;
  index: {
    name: string;
    keyPath: string | string[];
    compound: boolean;
  } | null;
  ranges?: Array<{
    type: 'Equal' | 'Range';
    lower?: any;
    upper?: any;
    lowerOpen?: boolean;
    upperOpen?: boolean;
  }>;
  where?: MangoExpression;
  orderBy?: string[];
  direction?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  filtering?: {
    indexCovered: string[];
    manualFilter: MangoExpression;
  };
  cursorBased?: boolean;
  estimatedComplexity?: string; // 'O(1)', 'O(log n)', 'O(n)', etc.
  notes?: string[];
  suggestedIndexes?: SuggestedIndex[];
}

// Global map of suggested indexes with their importance scores
// Key format: 'tableName:keyPath' (keyPath stringified for arrays)
// Value: highest priority seen for this index
export const suggestedIndexes = new Map<string, { keyPath: string | string[]; priority: number; reason: string }>();

export function recordSuggestedIndex(
  tableName: string,
  keyPath: string | string[],
  priority: number,
  reason: string
): void {
  const key = `${tableName}:${Array.isArray(keyPath) ? keyPath.join('+') : keyPath}`;
  const existing = suggestedIndexes.get(key);
  
  if (!existing || existing.priority < priority) {
    suggestedIndexes.set(key, { keyPath, priority, reason });
  }
}

export function getSuggestedIndexes(): Array<{ table: string; keyPath: string | string[]; priority: number; reason: string }> {
  const results: Array<{ table: string; keyPath: string | string[]; priority: number; reason: string }> = [];
  
  suggestedIndexes.forEach((value, key) => {
    const [table] = key.split(':');
    results.push({
      table,
      keyPath: value.keyPath,
      priority: value.priority,
      reason: value.reason,
    });
  });
  
  // Sort by priority (highest first)
  return results.sort((a, b) => b.priority - a.priority);
}

export function clearSuggestedIndexes(): void {
  suggestedIndexes.clear();
}
