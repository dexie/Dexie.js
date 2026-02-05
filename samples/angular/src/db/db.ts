import Dexie, { type EntityTable } from 'dexie';

/**
 * Interface representing a Todo List
 */
export interface TodoList {
  id?: number;
  title: string;
}

/**
 * Interface representing a Todo Item
 */
export interface TodoItem {
  id?: number;
  todoListId: number;
  title: string;
  done?: boolean;
}

/**
 * Dexie database class for the Todo application
 * Demonstrates the use of Dexie v4 with typed tables
 */
export class AppDatabase extends Dexie {
  todoLists!: EntityTable<TodoList, 'id'>;
  todoItems!: EntityTable<TodoItem, 'id'>;

  constructor() {
    super('TodoAngularSampleDB');

    this.version(1).stores({
      todoLists: '++id, title',
      todoItems: '++id, todoListId, done',
    });
  }
}

export const db = new AppDatabase();

/**
 * Populate the database with sample data
 */
export async function populateDatabase(): Promise<void> {
  const listCount = await db.todoLists.count();
  if (listCount > 0) return; // Already populated

  const listId = await db.todoLists.add({
    title: 'My First Todo List',
  }) as number;

  await db.todoItems.bulkAdd([
    { todoListId: listId, title: 'Learn Dexie.js', done: true },
    { todoListId: listId, title: 'Build Angular app with Dexie', done: false },
    { todoListId: listId, title: 'Explore liveQuery', done: false },
  ]);
}

/**
 * Reset the database by deleting and recreating it
 */
export async function resetDatabase(): Promise<void> {
  await db.delete();
  await db.open();
  await populateDatabase();
}
