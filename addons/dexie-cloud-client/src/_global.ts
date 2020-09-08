export const _global: any =
  typeof globalThis !== "undefined"
    ? globalThis
    : typeof self !== "undefined"
    ? self
    : typeof global === "undefined"
    ? global
    : this;

