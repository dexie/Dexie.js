import { b64LexDecode, b64LexEncode } from "../../common/b64lex.js";

export const arrayBufferTypeDef = {
  ArrayBuffer: {
    replace: (ab: ArrayBuffer) => ({
      $t: "ArrayBuffer",
      v: b64LexEncode(ab),
    }),
    revive: ({ v }: { v: string }): ArrayBuffer => {
      const ba = b64LexDecode(v);
      const buf = ba.buffer.byteLength === ba.byteLength
        ? ba.buffer
        : ba.buffer.slice(ba.byteOffset, ba.byteOffset + ba.byteLength);
      return buf as ArrayBuffer;
    },
  },
};

export default arrayBufferTypeDef;
