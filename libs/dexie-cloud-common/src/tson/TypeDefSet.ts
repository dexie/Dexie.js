import { TypeDef } from "./TypeDef.js";

export type TypeDefSet = {
  string?: TypeDef<string>;
  boolean?: TypeDef<boolean>;
  number?: TypeDef<number>;
  undefined?: TypeDef<undefined>;
  bigint?: TypeDef<bigint>;
  symbol?: TypeDef<Symbol>;
  function?: TypeDef<Function>;
  ArrayBuffer?: TypeDef<ArrayBuffer>;
  Date?: TypeDef<Date>;
  Map?: TypeDef<Map<any, any>>;
  Set?: TypeDef<Set<any>>;
  Int8Array?: TypeDef<Int8Array>;
  Uint8Array?: TypeDef<Uint8Array>;
  Uint8ClampedArray?: TypeDef<Uint8ClampedArray>;
  Int16Array?: TypeDef<Int16Array>;
  Uint16Array?: TypeDef<Uint16Array>;
  Int32Array?: TypeDef<Int32Array>;
  Uint32Array?: TypeDef<Uint32Array>;
  Float32Array?: TypeDef<Float32Array>;
  Float64Array?: TypeDef<Float64Array>;
  DataView?: TypeDef<DataView>;
  BigInt64Array?: TypeDef<BigInt64Array>;
  BigUint64Array?: TypeDef<BigUint64Array>;

  // Extentable with other types, custom, DOM or node types such as Blob, Buffer etc.
  [TypeName: string]: TypeDef<any, any> | undefined | null;
};
