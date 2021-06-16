import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { TodoList } from "../models/TodoList";
import { db } from "../models/db";
import { TodoItemView } from "./TodoItemView";
import { AddTodoItem } from "./AddTodoItem";

interface Props {
  todoList: TodoList;
}

export function TodoListView({ todoList }: Props) {
  const items = useLiveQuery(
    () => db.todoItems.where({ todoListId: todoList.id }).toArray(),
    [todoList.id]
  );

  if (!items) return null;

  return (
    <div className="box">
      <h2>{todoList.title}</h2>
      <div>
        {items.map(item => (
          <TodoItemView key={item.id} item={item} />
        ))}
      </div>
      <div>
        <AddTodoItem todoList={todoList} />
      </div>
    </div>
  );
}
