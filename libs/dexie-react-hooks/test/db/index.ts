import Dexie, { Table } from "dexie";
import { Item } from "../models/Item";

export class TestUseLiveQueryDB extends Dexie {
  items!: Table<Item, number>;

  constructor() {
    super("TestUseLiveQuery", {cache: 'immutable'});
    this.version(1).stores({
      items: "id"
    });
  }
}

export const db = new TestUseLiveQueryDB();

