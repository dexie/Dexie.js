export declare const PropModSymbol: unique symbol;

export type PropModSpec = {
  $replacePrefix?: [string, string];
}

export class PropModification implements PropModSpec {
  [PropModSymbol]?: true;
  $replacePrefix?: [string, string];

  constructor(spec: PropModSpec);
}
