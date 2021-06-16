import Dexie, { Table } from "dexie";
import { populate } from "./populate";
import { TodoItem } from "./TodoItem";
import { TodoList } from "./TodoList";

export class TodoDB extends Dexie {
  todoLists!: Table<TodoList, number>;
  todoItems!: Table<TodoItem, number>;
  constructor() {
    super("TodoDB");
    this.version(1).stores({
      todoLists: "++id",
      todoItems: "++id, todoListId"
    });
  }
}

export const db = new TodoDB();

db.on("populate", populate);

export function resetDatabase() {
  return db.transaction("rw", db.todoLists, db.todoItems, async () => {
    await Promise.all(db.tables.map(table => table.clear()));
    await populate();
  });
}
