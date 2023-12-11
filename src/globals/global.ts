declare var global;
export const _global: any =
    typeof globalThis !== 'undefined' ? globalThis :
    typeof self !== 'undefined' ? self :
    typeof window !== 'undefined' ? window :
    global;
