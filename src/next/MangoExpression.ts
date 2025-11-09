export type MangoRange = {
  $gt?: any;
  $gte?: any;
  $lt?: any;
  $lte?: any;
  $eq?: any;
  $ne?: any;
  $in?: any[];
  $nin?: any[];
  $inRanges?: MangoRange[];
};

export type MangoExpression =
  | { [prop: string]: MangoRange | any }
  | { $and: MangoExpression[] }
  | { $or: MangoExpression[] };

export type MangoRangeWithAliases = MangoRange & {
  [op in keyof typeof mangoRangeAliases]?: any;
}

export type MangoExpressionWithAliases =
  | { [prop: string]: MangoRangeWithAliases | any }
  | { $and: MangoExpressionWithAliases[] }
  | { $or: MangoExpressionWithAliases[] };

export const mangoRangeAliases = {
  above: (value: any) => ({ $gt: value }),
  aboveOrEqual: (value: any) => ({ $gte: value }),
  below: (value: any) => ({ $lt: value }),
  belowOrEqual: (value: any) => ({ $lte: value }),
  after: (value: any) => ({ $gt: value }),
  afterOrEqual: (value: any) => ({ $gte: value }),
  before: (value: any) => ({ $lt: value }),
  beforeOrEqual: (value: any) => ({ $lte: value }),
  equals: (value: any) => ({ $eq: value }),
  startsWith: (prefix: any) => ({ $gte: prefix, $lt: prefix + '\uffff' }),
  startsWithAnyOf: (prefixes: string[]) => ({
    $inRanges: prefixes.map((prefix) => ({
      $gte: prefix,
      $lt: prefix + '\uffff',
    })),
  }),
  anyOf: (values: any[]) => ({ $in: values }),
  noneOf: (values: any[]) => ({ $nin: values }),
  notEqual: (value: any) => ({ $ne: value }),
};


export function canonicalizeMango(expr: MangoExpressionWithAliases): MangoExpression {
  if (typeof expr !== 'object' || expr === null) {
    return expr;
  }
  if (Array.isArray(expr)) {
    throw new Error('Invalid Mango expression: ' + JSON.stringify(expr));
  }
  const result: any = {};
  for (const key of Object.keys(expr)) {
    if (key === '$and' || key === '$or') {
      result[key] = (expr as any)[key].map(canonicalizeMango);
    } else {
      const value = (expr as any)[key];
      if (typeof value === 'object' && value !== null) {
        const rangeResult: any = {};
        for (const opKey of Object.keys(value)) {
          if (opKey in mangoRangeAliases) {
            const aliasResult = mangoRangeAliases[opKey as keyof typeof mangoRangeAliases]((value as any)[opKey]);
            Object.assign(rangeResult, aliasResult);
          } else {
            rangeResult[opKey] = (value as any)[opKey];
          }
        }
        result[key] = rangeResult;
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}
  