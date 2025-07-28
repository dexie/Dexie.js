import type * as Y from 'yjs';

export interface YDocCache {
  readonly size: number;
  find: (table: string, primaryKey: any, ydocProp: string) => Y.Doc | undefined
  add: (doc: Y.Doc) => void;
  delete: (doc: Y.Doc) => void;
}
