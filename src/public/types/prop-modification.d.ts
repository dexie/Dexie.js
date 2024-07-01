export declare const PropModSymbol: unique symbol;

export type PropModSpec = {
  replacePrefix?: [string, string];
  add?: number | bigint | Array<string | number>;
  remove?: number | bigint | Array<string | number>;
}

export class PropModification implements PropModSpec {
  [PropModSymbol]?: true;
  replacePrefix?: [string, string];
  add?: number | bigint | Array<string | number>;
  remove?: number | bigint | Array<string | number>;

  execute<T>(value: T): T;

  constructor(spec: PropModSpec);
}
