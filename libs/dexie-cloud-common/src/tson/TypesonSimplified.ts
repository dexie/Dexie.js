import { TypeDef } from "./TypeDef.js";
import { TypeDefSet } from "./TypeDefSet.js";

const { toString: toStr } = {};
function getToStringTag(val: any) {
  return toStr.call(val).slice(8, -1);
}

export function escapeDollarProps(value: any) {
  const keys = Object.keys(value);
  let dollarKeys: string[] | null = null;
  for (let i = 0, l = keys.length; i < l; ++i) {
    if (keys[i][0] === "$") {
      dollarKeys = dollarKeys || [];
      dollarKeys.push(keys[i]);
    }
  }
  if (!dollarKeys) return value;
  const clone = { ...value };
  for (const k of dollarKeys) {
    delete clone[k];
  }
  for (const k of dollarKeys) {
    clone["$" + k] = value[k];
  }
  return clone;
}

const ObjectDef = {
  replace: escapeDollarProps,
};

export function TypesonSimplified(...typeDefsInputs: TypeDefSet[]) {
  const typeDefs: any = typeDefsInputs.reduce(
    (p, c) => ({ ...p, ...c }),
    typeDefsInputs.reduce((p, c) => ({ ...c, ...p }), {})
  );
  const protoMap = new WeakMap<object, TypeDef | null>();
  return {
    stringify(value: any, alternateChannel?: any, space?: number): string {
      const json = JSON.stringify(
        value,
        function (key: string) {
          const realVal = (this as any)[key];
          const typeDef = getTypeDef(realVal);
          return typeDef
            ? typeDef.replace(realVal, alternateChannel, typeDefs)
            : realVal;
        },
        space
      );
      return json;
    },

    parse(tson: string, alternateChannel?: any) {
      const stack: [object, string[], object][] = [];

      return JSON.parse(tson, function (key, value) {
        //
        // Parent Part
        //
        const type = value?.$t;
        if (type) {
          const typeDef = typeDefs[type];
          value = typeDef
            ? typeDef.revive(value, alternateChannel, typeDefs)
            : value;
        }
        let top = stack[stack.length - 1];
        if (top && top[0] === value) {
          // Do what the kid told us to
          // Unescape dollar props
          value = { ...value };
          // Delete keys that children wanted us to delete
          for (const k of top[1]) delete value[k];
          // Set keys that children wanted us to set
          for (const [k, v] of Object.entries(top[2])) {
            value[k] = v;
          }
          stack.pop();
        }

        //
        // Child part
        //
        if (value === undefined || (key[0] === "$" && key !== "$t")) {
          top = stack[stack.length - 1];
          let deletes: string[];
          let mods: Record<string, any>;
          if (top && top[0] === this) {
            deletes = top[1];
            mods = top[2] as Record<string, any>;
          } else {
            stack.push([this, (deletes = []), (mods = {})]);
          }
          if (key[0] === "$" && key !== "$t") {
            // Unescape props (also preserves undefined if this is a combo)
            deletes.push(key);
            mods[key.substr(1)] = value;
          } else {
            // Preserve undefined
            mods[key] = undefined;
          }
        }

        return value;
      });
    },
  };

  function getTypeDef(realVal: any): TypeDef | null {
    const type = typeof realVal;
    switch (typeof realVal) {
      case "object":
      case "function": {
        // "object", "function", null
        if (realVal === null) return null;
        const proto = Object.getPrototypeOf(realVal);
        if (!proto) return ObjectDef as any;
        let typeDef = protoMap.get(proto);
        if (typeDef !== undefined) return typeDef; // Null counts to! So the caching of Array.prototype also counts.
        const toStringTag = getToStringTag(realVal);
        const entry = Object.entries(typeDefs).find(
          ([typeName, typeDef]: [string, any]) =>
            typeDef?.test?.(realVal, toStringTag) ?? typeName === toStringTag
        );
        typeDef = entry?.[1] as TypeDef | undefined;
        if (!typeDef) {
          typeDef = Array.isArray(realVal)
            ? null
            : typeof realVal === "function"
            ? typeDefs.function || null
            : (ObjectDef as any);
        }
        protoMap.set(proto, typeDef!);
        return typeDef!;
      }
      default:
        return typeDefs[type];
    }
  }
}
