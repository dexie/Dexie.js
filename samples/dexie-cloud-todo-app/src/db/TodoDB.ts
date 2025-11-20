import Dexie, { Table } from 'dexie';
import dexieCloud, { DexieCloudTable } from 'dexie-cloud-addon';
import { TodoItem } from './TodoItem';
import { TodoList } from './TodoList';

export class TodoDB extends Dexie {
  todoLists!: DexieCloudTable<TodoList, 'id'>;
  todoItems!: DexieCloudTable<TodoItem, 'id'>;
  openCloseStates!: Table<boolean, [string, string]>;

  constructor() {
    super('TodoDBCloud2', {
      addons: [dexieCloud],
      cache: "immutable"
    });

    this.version(15).stores({
      todoLists: `@id, [realmId+id]`,
      todoItems: `@id, realmId, [todoListId+realmId]`,
      openCloseStates: `` // Set of open ids (persisted local state only)
    });
    this.todoLists.mapToClass(TodoList);

    // Configure cloud:
    //
    // See docs: https://dexie.org/cloud/docs/db.cloud.configure()
    //
    this.cloud.configure({
      unsyncedTables: ['openCloseStates'], // See also unsyncedProperties
      databaseUrl: import.meta.env.VITE_DBURL!,
      tryUseServiceWorker: true,
      requireAuth: false,
    });
  }
}
