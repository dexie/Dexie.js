import { MangoExpression } from './MangoExpression.mjs';

export class Query {
  where: MangoExpression | null;
  limit: number;
  offset: number;
  orderBy: string[];
  direction: 'asc' | 'desc';

  constructor() {
    this.where = null;
    this.limit = Infinity;
    this.offset = 0;
    this.orderBy = [];
    this.direction = 'asc';
  }
}
