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
}
