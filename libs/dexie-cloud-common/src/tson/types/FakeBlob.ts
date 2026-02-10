import { b64decode, b64encode } from "../../common/base64.js";
import { FakeBlob } from "../FakeBlob.js";

export const fakeBlobTypeDef = {
  Blob: {
    test: (blob: FakeBlob) => blob instanceof FakeBlob,
    replace: (blob: FakeBlob) => ({
      $t: "Blob",
      v: b64encode(blob.buf),
      type: blob.type,
    }),
    revive: ({ type, v }: { type: string; v: string }) => {
      const ba = b64decode(v);
      // Handle Node.js Buffer's shared ArrayBuffer pool
      const buf = ba.buffer.byteLength === ba.byteLength
        ? (ba.buffer as ArrayBuffer)
        : (ba.buffer as ArrayBuffer).slice(ba.byteOffset, ba.byteOffset + ba.byteLength);
      return new FakeBlob(buf, type);
    },
  },
};

export default fakeBlobTypeDef;
