import React, { useEffect, useState } from 'react';
import { useLiveQuery, usePermissions } from 'dexie-react-hooks';
import { TodoList } from '../db/TodoList';
import { db, TodoDB } from '../db';
import { TodoItemView } from './TodoItemView';
import { AddTodoItem } from './AddTodoItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { SharingForm } from './access-control/SharingForm';
import { usePersistedOpenState } from '../helpers/usePersistedOpenState';

interface Props {
  todoList: TodoList;
}

export function TodoListView({ todoList }: Props) {
  const items = useLiveQuery(
    () => db.todoItems.where({ todoListId: todoList.id }).toArray(),
    [todoList.id]
  );
  const can = usePermissions(todoList);
  const [showInviteForm, setShowInviteForm] = usePersistedOpenState('sharing-menu', todoList.id, false);

  if (!items) return null;

  return (
    <div className="box">
      <div className="grid-row">
        <h2>{todoList.title}</h2>
        <div className="todo-list-trash">
          <button
            disabled={!can.delete()}
            onClick={() => todoList.delete()}
            title="Delete list"
          >
            <FontAwesomeIcon icon={faTrashAlt} />
          </button>
        </div>

        {!todoList.isPrivate() && <div className="todo-list-trash">
          <button
            onClick={() => setShowInviteForm(!showInviteForm)}
          >
            <FontAwesomeIcon icon={faShareAlt} />
          </button>
        </div>}
      </div>
      {showInviteForm && <SharingForm todoList={todoList} />}
      <div>
        {items.map((item) => (
          <TodoItemView key={item.id} item={item} />
        ))}
      </div>
      <div>{can.add('todoItems') && <AddTodoItem todoList={todoList} />}</div>
    </div>
  );
}
