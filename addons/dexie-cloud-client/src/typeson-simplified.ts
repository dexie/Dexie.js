export interface TypeDef<T = unknown, TReplaced = unknown> {
  test?: (val: T, toStringTag: string) => boolean;
  replace?: (val: T, nonStringifyables: any[]) => TReplaced & { $type: string };
  revive: (val: TReplaced, nonStringifyables: any[]) => T;
}

export type TypeDefSet = { [TypeName: string]: TypeDef };

const { toString: toStr } = {};
function getToStringTag(val: any) {
  return toStr.call(val).slice(8, -1);
}

function escapeDollarProps(value: any) {
  const keys = Object.keys(value);
  let dollarKeys: string[] | null = null;
  for (let i = 0, l = keys.length; i < l; ++i)
    if (keys[i][0] === "$")
      dollarKeys = (dollarKeys || ([] as string[])).concat(keys[i]);
  if (!dollarKeys) return value;
  const clone = { ...value };
  for (const k of dollarKeys) {
    delete clone[k];
    clone["$" + k] = value[k];
  }
  return clone;
}

const buildInDefs: TypeDefSet = {
  bigint: {
    revive: (val: { $type: "bigint"; value: ArrayBuffer }) =>
      bufToBigint(new Uint8Array(val.value)),
  },
  NaN: { revive: () => NaN },
  Infinity: { revive: () => Infinity },
  NegativeInfinity: { revive: () => -Infinity }
};

const replacerMap = new WeakMap<
  object,
  (value: any, nonStringifyables: any[]) => any
>();

export function TypesonSimplified(...typeDefsInputs: TypeDefSet[]) {
  const typeDefs = typeDefsInputs.reduce(
    (p, c) => ({ ...p, ...c }),
    buildInDefs
  );
  return {
    stringify(value: any, space?: number): [string, any[]] {
      const nonStringifyables = [];
      const json = JSON.stringify(
        value,
        function (key: string, jsonVal) {
          let realVal = this[key];
          //
          // Replacing
          //
          switch (typeof realVal) {
            case "string":
            case "boolean":
            case "undefined":
              return jsonVal;
            case "number":
              if (isNaN(realVal)) return { $type: "NaN" };
              if (realVal === Infinity) return { $type: "Infinity" };
              if (realVal === -Infinity) return { $type: "NegativeInfinity" };
              return jsonVal;
            case "bigint":
              return {
                $type: "bigint",
                value: Uint8Array.from(
                  (realVal.toString(16).match(/[\da-f]{2}/gi) || []).map((h) =>
                    parseInt(h, 16)
                  )
                ).buffer,
              };
            case "object": {
              const proto = Object.getPrototypeOf(realVal);
              if (!proto) return jsonVal;
              let replacer = replacerMap.get(proto);
              if (!replacer) {
                const toStringTag = getToStringTag(realVal);
                const entry = Object.entries(
                  typeDefs
                ).find(([typeName, typeDef]) =>
                  typeDef.test
                    ? typeDef.test(realVal, toStringTag)
                    : typeName === toStringTag
                );
                replacer = entry ? entry[1].replace! : escapeDollarProps;
                replacerMap.set(proto, replacer);
              }
              return replacer(value, nonStringifyables);
            }

            default:
              // Don't support symbols or functions yet.
              return jsonVal;
          }
        },
        space
      );
      return [json, nonStringifyables];
    },

    parse(tson: string, nonStringifyables: any[]) {
      let parent = null;
      let unescapeParentKeys: string[] = [];
      let parentType = "";

      return JSON.parse(tson, function (key, value) {
        //
        // Parent Part
        //
        if (value === parent) {
          parent = null;
          // Do what the kid told us to
          if (unescapeParentKeys.length > 0) {
            // Unescape dollar props
            value = { ...value };
            for (const k of unescapeParentKeys) {
              value[k.substr(1)] = value[k];
              delete value[k];
            }
            unescapeParentKeys = [];
          }
          if (parentType) {
            // Revive type
            value = typeDefs[parentType].revive(value, nonStringifyables);
            parentType = "";
          }
          return value;
        }

        //
        // Child part
        //
        if (key[0] === "$") {
          parent = this;
          if (key === "$type") {
            // Tell parent to revive this type
            parentType = value;
          } else {
            unescapeParentKeys.push(key);
          }
          return value;
        }
      });
    },
  };
}

// From https://github.com/juanelas/bigint-conversion/blob/master/src/js/index.js
export function bufToBigint(buf: Uint8Array) {
  let bits = BigInt(8);
  if (ArrayBuffer.isView(buf)) bits = BigInt(buf.BYTES_PER_ELEMENT * 8);
  else buf = new Uint8Array(buf);

  let ret = BigInt(0);
  let iter = buf[Symbol.iterator]();
  let ir: IteratorResult<number>;
  while (true) {
    ir = iter.next();
    if (ir.done) break;
    const bi = BigInt(ir.value);
    ret = (ret << bits) | bi;
  }
  return ret;
}
