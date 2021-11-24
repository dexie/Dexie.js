import { Entity } from "dexie";
import { TodoDB } from ".";

export class TodoItem extends Entity<TodoDB> {
  id?: string;
  realmId!: string;
  todoListId!: string;
  title!: string;
  owner!: string;
  done?: boolean;
}
