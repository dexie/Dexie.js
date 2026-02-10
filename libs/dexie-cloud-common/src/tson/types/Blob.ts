import { b64decode, b64encode } from "../../common/base64.js";
import { FakeBlob } from "../FakeBlob.js";
import { readBlobSync } from "../readBlobSync.js";
import { string2ArrayBuffer } from "../string2ArrayBuffer.js";

export const blobTypeDef = {
  Blob: {
    test: (blob: Blob | FakeBlob, toStringTag: string) =>
      toStringTag === "Blob" || blob instanceof FakeBlob,
    replace: (blob: Blob | FakeBlob) => ({
      $t: "Blob",
      v:
        blob instanceof FakeBlob
          ? b64encode(blob.buf)
          : b64encode(string2ArrayBuffer(readBlobSync(blob))),
      type: blob.type,
    }),
    revive: ({ type, v }: { type: string; v: string }) => {
      const ab = b64decode(v);
      const buf = ab.buffer.byteLength === ab.byteLength
        ? (ab.buffer as ArrayBuffer)
        : (ab.buffer as ArrayBuffer).slice(ab.byteOffset, ab.byteOffset + ab.byteLength);
      return typeof Blob !== undefined
        ? new Blob([new Uint8Array(buf)])
        : new FakeBlob(buf, type);
    },
  },
};

export default blobTypeDef;
