export const _global: any =
  typeof globalThis !== "undefined" // All modern environments (node, bun, deno, browser, workers, webview etc)
    ? globalThis
    : typeof self !== "undefined" // Older browsers, workers, webview, window etc
    ? self
    : typeof global !== "undefined" // Older versions of node
    ? global
    : undefined; // Unsupported environment. No idea to return 'this' since we are in a module or a function scope anyway.
