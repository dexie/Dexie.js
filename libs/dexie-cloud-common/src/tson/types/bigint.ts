import { TypeDefSet } from "../TypeDefSet.js";

export const bigintTypeDef: TypeDefSet = {
  bigint: {
    replace: (realVal: bigint) => {
      return { $t: "bigint", v: "" + realVal };
    },
    revive: (obj: { $t: "bigint"; v: string }) => BigInt(obj.v),
  },
};

export default bigintTypeDef;
