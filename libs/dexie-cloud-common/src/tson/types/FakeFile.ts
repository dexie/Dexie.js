import { b64decode, b64encode } from "../../common/base64.js";
import { FakeBlob } from "../FakeBlob.js";
import { FakeFile } from "../FakeFile.js";

export const fakeFileTypeDef = {
  File: {
    test: (file: FakeFile) => file instanceof FakeFile,
    replace: (file: FakeFile) => ({
      $t: "File",
      v: b64encode(file.blob.buf),
      type: file.blob.type,
      name: file.name,
      lastModified: file.lastModified.toISOString(),
    }),
    revive: ({ type, v, name, lastModified }: { type: string; v: string; name: string; lastModified: string }) => {
      const ab = b64decode(v);
      const buf = ab.buffer.byteLength === ab.byteLength
        ? (ab.buffer as ArrayBuffer)
        : (ab.buffer as ArrayBuffer).slice(ab.byteOffset, ab.byteOffset + ab.byteLength);
      const blob = new FakeBlob(buf, type);
      return new FakeFile(blob, name, new Date(lastModified));
    },
  },
};

export default fakeFileTypeDef;
