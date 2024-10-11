import type * as Y from 'yjs';
export interface TodoItem {
  id: string;
  realmId: string;
  todoListId: string;
  title: string;
  owner: string;
  done?: boolean;
  description: Y.Doc;
}
