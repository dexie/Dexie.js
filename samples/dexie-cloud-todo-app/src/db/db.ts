import Dexie from 'dexie';
import dexieCloud, { DexieCloudTable } from 'dexie-cloud-addon';
import { populate } from '../models/populate';
import { TodoItem } from '../models/TodoItem';
import { TodoList } from '../models/TodoList';

export class TodoDB extends Dexie {
  todoLists!: DexieCloudTable<TodoList>;
  todoItems!: DexieCloudTable<TodoItem>;

  constructor() {
    super('TodoDBCloud', { addons: [dexieCloud] });
    this.version(1).stores({
      todoLists: '@id',
      todoItems: '@id, todoListId',
    });
    // Connect to cloud
    this.cloud.configure({
      databaseUrl: process.env.REACT_APP_DBURL!,
      tryUseServiceWorker: true, // true!
      requireAuth: false,
    });
  }

  deleteList(todoListId: string) {
    return this.transaction('rw', this.todoItems, this.todoLists, () => {
      this.todoItems.where({ todoListId }).delete();
      this.todoLists.delete(todoListId);
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
