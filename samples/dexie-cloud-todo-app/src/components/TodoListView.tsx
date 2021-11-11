import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { TodoList } from '../db/TodoList';
import { db } from '../db';
import { TodoItemView } from './TodoItemView';
import { AddTodoItem } from './AddTodoItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { InviteForm } from './InviteForm';

interface Props {
  todoList: TodoList;
}

export function TodoListView({ todoList }: Props) {
  const items = useLiveQuery(
    () => db.todoItems.where({ todoListId: todoList.id }).toArray(),
    [todoList.id]
  );
  const [showInviteForm, setShowInviteForm] = useState(false);

  if (!items) return null;

  return (
    <div className="box">
      <div className="grid-row">
        <h2>{todoList.title}</h2>
        <div className="todo-list-trash">
          <button onClick={() => todoList.delete()} title="Delete list">
            <FontAwesomeIcon icon={faTrashAlt} />
          </button>
          </div>
          <div className="todo-list-trash">
          <button onClick={()=>setShowInviteForm(!showInviteForm)}>
            <FontAwesomeIcon icon={faShareAlt} />
          </button>
        </div>
      </div>
      {showInviteForm && <InviteForm todoList={todoList} />}
      <div>
        {items.map((item) => (
          <TodoItemView key={item.id} item={item} />
        ))}
      </div>
      <div>
        <AddTodoItem todoList={todoList} />
      </div>
    </div>
  );
}
