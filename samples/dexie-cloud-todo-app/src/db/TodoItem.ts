export interface TodoItem {
  realmId?: string;
  id?: string;
  todoListId: string;
  title: string;
  done?: boolean;
}
