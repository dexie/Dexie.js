import { TypeDefSet } from "../TypeDefSet.js";
import { numberTypeDef } from "../types/number.js";
import { bigintTypeDef } from "../types/bigint.js";
import { dateTypeDef } from "../types/Date.js";
import { setTypeDef } from "../types/Set.js";
import { mapTypeDef } from "../types/Map.js";
import { typedArrayTypeDefs } from "../types/TypedArray.js";
import { arrayBufferTypeDef } from "../types/ArrayBuffer.js";
import { blobTypeDef } from "../types/Blob.js";

export const builtInTypeDefs: TypeDefSet = {
  ...numberTypeDef,
  ...bigintTypeDef,
  ...dateTypeDef,
  ...setTypeDef,
  ...mapTypeDef,
  ...typedArrayTypeDefs,
  ...arrayBufferTypeDef,
  ...blobTypeDef, // Should be moved to another preset for DOM types (or universal? since it supports node as well with FakeBlob)
};

// Keep default export for backward compatibility
export default builtInTypeDefs;
