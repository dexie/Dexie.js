// Minimal ambient declaration for 'yjs' used for type Doc
declare module 'yjs' {
  export type Doc = {
    // Minimal Doc shape used by dexie-react-hooks; real API is larger
    toJSON?: () => any;
  };
}
