import React from "react";
import { db } from "../models/db";
import { TodoItem } from "../models/TodoItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";

interface Props {
  item: TodoItem;
}

export function TodoItemView({ item }: Props) {
  return (
    <div className={"row " + (item.done ? "done" : "")}>
      <div className="narrow">
        <input
          type="checkbox"
          checked={!!item.done}
          onChange={ev =>
            db.todoItems.update(item, {
              done: ev.target.checked
            })
          }
        />
      </div>
      <div className="todo-item-text">{item.title}</div>
      <div className="todo-item-trash">
        <a onClick={() => db.todoItems.delete(item.id!)} title="Delete item">
          <FontAwesomeIcon icon={faTrashAlt} />
        </a>
      </div>
    </div>
  );
}
