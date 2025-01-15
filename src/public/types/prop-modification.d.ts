export type PropModSpec = {
  replacePrefix?: [string, string];
  add?: number | bigint | Array<string | number>;
  remove?: number | bigint | Array<string | number>;
}

export class PropModification {
  ["@@propmod"]: PropModSpec;
  constructor(spec: PropModSpec);
  execute<T>(value: T): T;
}
