// Minimal ambient declarations for 'y-dexie' to satisfy type imports
// This is a local quickfix for TypeScript ESM/CJS resolution issues.
declare module 'y-dexie' {
  // Inline minimal Y.Doc type to avoid depending on 'yjs' ambient declaration
  export type YDoc = {
    // minimal shape used by dexie-react-hooks
    toJSON?: () => any;
  };

  export type DexieYProvider = {
    doc?: YDoc | null;
    // Partial API surface used by dexie-react-hooks
    release?: (doc?: YDoc) => void;
  };

  export const DexieYProvider: {
    load(doc: YDoc, options?: any): DexieYProvider;
    for(doc: YDoc): DexieYProvider | undefined;
    release(doc: YDoc): void;
  };

  export type YUpdateRow = any;
  export type YSyncState = any;

  export function compressYDocs(docs: unknown): unknown;

  export default function yDexie(dbOrOptions?: any): any;
}
