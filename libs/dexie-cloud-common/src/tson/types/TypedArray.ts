import { _global } from "../../common/_global.js";
import { TypeDef } from "../TypeDef.js";

export const typedArrayTypeDefs = [
  "Int8Array",
  "Uint8Array",
  "Uint8ClampedArray",
  "Int16Array",
  "Uint16Array",
  "Int32Array",
  "Uint32Array",
  "Float32Array",
  "Float64Array",
  "DataView",
  "BigInt64Array",
  "BigUint64Array",
].reduce(
  (specs, typeName) => ({
    ...specs,
    [typeName]: {
      // Replace passes the typed array into $t, buffer so that
      // the ArrayBuffer typedef takes care of further handling of the buffer:
      // {$t:"Uint8Array",buffer:{$t:"ArrayBuffer",idx:0}}
      // CHANGED ABOVE! Now shortcutting that for more sparse format of the typed arrays
      // to contain the b64 property directly.
      replace: (
        a: ArrayBufferView,
        _: any,
        typeDefs: { ArrayBuffer: TypeDef<ArrayBuffer, { v: string }> },
      ) => {
        const buffer = a.buffer as ArrayBuffer;
        const slicedBuffer = a.byteOffset === 0 && a.byteLength === buffer.byteLength
          ? buffer
          : buffer.slice(a.byteOffset, a.byteOffset + a.byteLength);
        const result = {
          $t: typeName,
          v: typeDefs.ArrayBuffer.replace(slicedBuffer, _, typeDefs as any).v,
        };
        return result;
      },
      revive: (
        { v }: { v: string },
        _: any,
        typeDefs: { ArrayBuffer: TypeDef<ArrayBuffer, { v: string }> },
      ) => {
        const TypedArray = _global[typeName];
        return (
          TypedArray &&
          new TypedArray(typeDefs.ArrayBuffer.revive({ v }, _, typeDefs as any))
        );
      },
    },
  }),
  {},
);

export default typedArrayTypeDefs;
