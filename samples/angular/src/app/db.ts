// db.ts - Database definition with typed tables
import Dexie, { type EntityTable } from 'dexie';

// Entity interfaces
export interface TodoList {
  id: number;
  title: string;
}

export interface TodoItem {
  id: number;
  todoListId: number;
  title: string;
  done: boolean;
}

// Database class with typed tables
const db = new Dexie('AngularTodoApp') as Dexie & {
  todoLists: EntityTable<TodoList, 'id'>;
  todoItems: EntityTable<TodoItem, 'id'>;
};

db.version(1).stores({
  todoLists: '++id',
  todoItems: '++id, todoListId',
});

// Populate with sample data on first run
db.on('populate', async () => {
  const todoListId = await db.todoLists.add({
    title: 'To Do Today',
  });
  await db.todoItems.bulkAdd([
    { todoListId, title: 'Feed the birds', done: false },
    { todoListId, title: 'Watch a movie', done: false },
    { todoListId, title: 'Have some sleep', done: false },
  ]);
});

export { db };
