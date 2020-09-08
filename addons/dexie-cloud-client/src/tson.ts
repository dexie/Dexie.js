import Typeson from "typeson";
import StructuredCloning from "typeson-registry/dist/presets/structured-cloning";
import typedArray from "./tson-typed-array";

// @ts-ignore
export const TSON = new Typeson().register(StructuredCloning);

const WEBSOCKET_COMPATIBLE_BINARY_TYPES = ["ArrayBuffer", "Blob", "Buffer"];

TSON.binaryChunks = [] as Array<Blob | ArrayBuffer>;
TSON.binaryChunkPos = 0;

TSON.register([
  typedArray,
  {
    BinaryChunk: {
      test(x) {
        return WEBSOCKET_COMPATIBLE_BINARY_TYPES.includes(
          //@ts-ignore
          Typeson.toStringTag(x)
        );
      },
      replace(b: Blob | ArrayBuffer) {
        TSON.binaryChunks.push(b);
        return 0;
      },
      revive(index: number) {
        return TSON.binaryChunks[TSON.binaryChunks++];
      },
    },
  },
]);
