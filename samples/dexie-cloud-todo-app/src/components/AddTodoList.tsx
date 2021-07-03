import { faList } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { db } from "../models/db";

export function AddTodoList() {
  const [isActive, setIsActive] = useState(false);
  const [title, setTitle] = useState("");

  return !isActive ? (
    <button className="large-button" onClick={() => setIsActive(!isActive)}>
      <FontAwesomeIcon icon={faList} /> Add another list
    </button>
  ) : (
    <div className="box">
      <h2>Give your list a name:</h2>
      <div className="todo-item-input">
        <input
          type="text"
          autoFocus
          placeholder="Name of list..."
          value={title}
          onChange={ev => setTitle(ev.target.value)}
          onKeyUp={ev => {
            if (ev.key === "Enter") {
              db.todoLists.add({ title });
              setTitle("");
              setIsActive(false);
            }
          }}
        />
      </div>
    </div>
  );
}
