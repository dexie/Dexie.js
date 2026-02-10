import { b64decode, b64encode } from "../../common/base64.js";
import { readBlobSync } from "../readBlobSync.js";
import { string2ArrayBuffer } from "../string2ArrayBuffer.js";

export const fileTypeDef = {
  File: {
    test: (file: File, toStringTag: string) => toStringTag === "File",
    replace: (file: File) => ({
      $t: "File",
      v: b64encode(string2ArrayBuffer(readBlobSync(file))),
      type: file.type,
      name: file.name,
      lastModified: new Date(file.lastModified).toISOString(),
    }),
    revive: ({ type, v, name, lastModified }: { type: string; v: string; name: string; lastModified: string }) => {
      const ab = b64decode(v);
      const buf = ab.buffer.byteLength === ab.byteLength
        ? (ab.buffer as ArrayBuffer)
        : (ab.buffer as ArrayBuffer).slice(ab.byteOffset, ab.byteOffset + ab.byteLength);
      return new File([new Uint8Array(buf)], name, {
        type,
        lastModified: new Date(lastModified).getTime(),
      });
    },
  },
};

export default fileTypeDef;
