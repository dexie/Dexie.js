import React, { useState } from "react";
import { db } from "../db";
import { TodoItem } from "../models/TodoItem";
import { TodoList } from "../models/TodoList";

interface Props {
  todoList: TodoList;
}

export function AddTodoItem({ todoList }: Props) {
  const [item, setItem] = useState({
    todoListId: todoList.id,
    title: ""
  } as TodoItem);

  return (
    <div className="row add-item">
      <div className="narrow">
        <input type="checkbox" disabled />
      </div>
      <div className="todo-item-input">
        <input
          type="text"
          placeholder="Add todo item ..."
          value={item.title}
          onChange={ev =>
            setItem(item => ({
              ...item,
              title: ev.target.value
            }))
          }
          onKeyUp={ev => {
            if (ev.key === "Enter") {
              db.todoItems.add(item);
              setItem({
                todoListId: todoList.id,
                title: ""
              } as TodoItem);
            }
          }}
        />
      </div>
    </div>
  );
}
