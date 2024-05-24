export declare const PropModSymbol: unique symbol;

export type PropModSpec = {
  replacePrefix?: [string, string];
  add?: number | BigInt | Array<string | number>;
  remove?: number | BigInt | Array<string | number>;
}

export class PropModification implements PropModSpec {
  [PropModSymbol]?: true;
  replacePrefix?: [string, string];
  add?: number | BigInt | Array<string | number>;
  remove?: number | BigInt | Array<string | number>;

  execute<T>(value: T): T;

  constructor(spec: PropModSpec);
}
