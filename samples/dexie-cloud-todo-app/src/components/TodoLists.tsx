import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import { TodoListView } from "./TodoListView";

export function TodoLists() {
  const lists = useLiveQuery(() => db.todoLists.toArray());

  if (!lists) return null;

  return (
    <div>
      {lists.map(list => (
        <TodoListView key={list.id} todoList={list} />
      ))}
    </div>
  );
}
