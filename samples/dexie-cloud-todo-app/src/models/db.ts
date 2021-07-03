import Dexie, { Table } from 'dexie';
import dexieCloud, { DexieCloudTable } from 'dexie-cloud-addon';
import { populate } from './populate';
import { TodoItem } from './TodoItem';
import { TodoList } from './TodoList';

export class TodoDB extends Dexie {
  todoLists!: DexieCloudTable<TodoList>;
  todoItems!: DexieCloudTable<TodoItem>;

  constructor() {
    super('TodoDBCloud', { addons: [dexieCloud] });
    this.version(1).stores({
      todoLists: '@id',
      todoItems: '@id, todoListId'
    });
    // Connect to cloud
    this.cloud.configure({
      databaseUrl: process.env.REACT_APP_DBURL!,
      tryUseServiceWorker: true,
      requireAuth: false
    });
  }
}

export const db = new TodoDB();

db.on('populate', populate);

export async function resetDatabase() {
  await db.delete();
  window.location.reload();
  /*return db.transaction('rw', db.todoLists, db.todoItems, async () => {
    await db.todoItems
      .filter((tdi) => !tdi.realmId || tdi.realmId === db.cloud.currentUserId)
      .delete();
    await db.todoLists
      .filter((tdl) => !tdl.realmId || tdl.realmId === db.cloud.currentUserId)
      .delete();
    await populate();
  });*/
}
