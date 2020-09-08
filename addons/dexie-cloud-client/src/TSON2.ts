import { TypeDefSet, TypesonSimplified } from "./typeson-simplified";
import { _global } from "./_global";

const defs: TypeDefSet = {
  Date: {
    replace: (date: Date) => ({ $type: "Date", value: date.getTime() }),
    revive: ({ value }) => new Date(value),
  },
  Map: {
    replace: (map: Map<any, any>) => ({
      $type: "Map",
      entries: Array.from(map.entries()),
    }),
    revive: ({ entries }) => new Map(entries),
  },
  Set: {
    replace: (set: Set<any>) => ({
      $type: "Set",
      entries: Array.from(set.entries()),
    }),
    revive: ({ entries }) => new Set(entries),
  },
  ArrayBuffer: {
    replace: (ab: ArrayBufferView, nonStringifyables) => {
      const i = nonStringifyables.length;
      nonStringifyables.push(ab);
      return {
        $type: "ArrayBuffer",
        i,
      };
    },
    revive: ({ i }, nonStringifyables) => nonStringifyables[i], // Requires having websocket.binaryType = "arraybuffer"!
  },
  Blob: {
    replace: (blob: Blob, nonStringifyables) => {
      const i = nonStringifyables.length;
      nonStringifyables.push(blob);
      return {
        $type: "Blob",
        mimeType: blob.type,
        i,
      };
    },
    revive: ({ i, mimeType }, nonStringifyables) =>
      new Blob([nonStringifyables[i]], { type: mimeType }),
  },
};

// Typed Arrays
[
  "Int8Array",
  "Uint8Array",
  "Uint8ClampedArray",
  "Int16Array",
  "Uint16Array",
  "Int32Array",
  "Uint32Array",
  "Float32Array",
  "Float64Array",
].forEach((typeName) => {
  defs[typeName] = {
    // Replace passes the the typed array into $type, buffer so that
    // the ArrayBuffer typedef takes care of further handling of the buffer:
    // {$type:"Uint8Array",buffer:{$type:"ArrayBuffer",idx:0}}
    replace: (a: Uint8Array) => ({
      $type: typeName,
      buffer: (a.byteOffset === 0 && a.byteLength === a.buffer.byteLength
        ? a
        : a.slice(0)
      ).buffer, // Make sure to only store an ArrayBuffer with exact same size
    }),
    revive: ({ buffer }) => {
      const ConcreteArray = _global[typeName];
      return ConcreteArray ? new ConcreteArray(buffer) : null;
    },
  };
});

export const TSON = TypesonSimplified(defs);
