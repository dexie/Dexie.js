import { TypesonSimplified } from 'dreambase-library/dist/typeson-simplified/TypesonSimplified';
import { Bison } from "dreambase-library/dist/typeson-simplified/Bison";
import undefinedDef from 'dreambase-library/dist/typeson-simplified/types/undefined.js';
import tsonBuiltinDefs from 'dreambase-library/dist/typeson-simplified/presets/builtin.js';
import { TypeDefSet } from 'dreambase-library/dist/typeson-simplified/TypeDefSet';

// Since server revisions are stored in bigints, we need to handle clients without
// bigint support to not fail when serverRevision is passed over to client.
// We need to not fail when reviving it and we need to somehow store the information.
// Since the revived version will later on be put into indexedDB we have another
// issue: When reading it back from indexedDB we will get a poco object that we
// cannot replace correctly when sending it to server. So we will also need
// to do an explicit workaround in the protocol where a bigint is supported.
// The workaround should be there regardless if browser supports BigInt or not, because
// the serverRev might have been stored in IDB before the browser was upgraded to support bigint.
//
// if (typeof serverRev.rev !== "bigint")
//   if (hasBigIntSupport)
//     serverRev.rev = bigIntDef.bigint.revive(server.rev)
//   else
//     serverRev.rev = new FakeBigInt(server.rev)
export const hasBigIntSupport = typeof BigInt !== 'undefined';

export class FakeBigInt {
  v: string;
  static compare(a: bigint | FakeBigInt, b:bigint | FakeBigInt) {
    if (typeof a === "bigint") return a < b ? -1 : a > b ? 1 : 0;
    if (typeof b === "bigint") throw new TypeError("Can't compare real bigint with FakeBigInt");
    // Here, we can only compare in best effort.
    return Number(a) < Number(b) ? -1 : Number(a) > Number(b) ? 1 : 0;
  }
  toString() {
    return this.v;
  }
  constructor(value: string) {
    this.v = value;
  }
}

const defs: TypeDefSet = {
  ...undefinedDef,
  ...(hasBigIntSupport
    ? {}
    : {
        bigint: {
          test: (val: any) => val instanceof FakeBigInt,
          replace: (fakeBigInt: any) => {
            return {
              $t: 'bigint',
              ...fakeBigInt
            };
          },
          revive: ({
            v,
          }: {
            $t: 'bigint';
            v: string;
          }) => new FakeBigInt(v) as any as bigint
        }
      })
};

export const TSON = TypesonSimplified(tsonBuiltinDefs, defs);

export const BISON = Bison(defs);
