import React, { useEffect, useState } from 'react';
import { db } from '../db';
import { TodoItem } from '../db/TodoItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { usePermissions } from 'dexie-react-hooks';

interface Props {
  item: TodoItem;
}

export function TodoItemView({ item }: Props) {
  const can = usePermissions(db, 'todoItems', item);
  return (
    <div className={'row ' + (item.done ? 'done' : '')}>
      <div className="narrow">
        <input
          type="checkbox"
          disabled={!can.update('done')}
          checked={!!item.done}
          onChange={(ev) => {
            db.todoItems.update(item.id, {
              done: ev.target.checked,
            });
          }}
        />
      </div>
      <div className="todo-item-text">{item.title}</div>
      <div className="todo-item-trash">
        <button
          disabled={!can.delete()}
          onClick={() => db.todoItems.delete(item.id!)}
          title="Delete item"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    </div>
  );
}
