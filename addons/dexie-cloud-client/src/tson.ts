import { TypeDefSet } from "dreambase-library/dist/typeson-simplified/TypeDefSet";
import { TypesonSimplified } from "dreambase-library/dist/typeson-simplified/TypesonSimplified";
import builtInTypeDefs from "dreambase-library/dist/typeson-simplified/presets/builtin";

const defs: TypeDefSet = {
  WSArrayBuffer: {
    test: (ab: ArrayBuffer, toStringTag) => toStringTag === "ArrayBuffer",
    replace: (ab: ArrayBuffer, altChannel: (Blob | ArrayBuffer)[]) => {
      const i = altChannel.length;
      altChannel.push(ab);
      return {
        $t: "WSArrayBuffer",
        i,
      };
    },
    revive: ({ i }, altChannel) => altChannel[i] as ArrayBuffer, // Requires having websocket.binaryType = "arraybuffer"!
  },
  WSBlob: {
    test: (blob: Blob, toStringTag) => toStringTag === "Blob",
    replace: (blob: Blob, altChannel: (Blob | ArrayBuffer)[]) => {
      const i = altChannel.length;
      altChannel.push(blob);
      return {
        $t: "WSBlob",
        mimeType: blob.type,
        i,
      };
    },
    revive: ({ i, mimeType }, altChannel: ArrayBuffer[]) =>
      new Blob([altChannel[i]], { type: mimeType }),
  },
  ...builtInTypeDefs,
};

export const TSON = TypesonSimplified(defs);
