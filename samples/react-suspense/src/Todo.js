import React from 'react';
import './Todo.css';

export const Todo = ({title, id, done, handleToggleTodo, handleDeleteTodo}) => <li>
  <input
    type="checkbox"
    checked={!!done}
    onChange={ev => handleToggleTodo(id, ev.target.checked ? Date.now() : 0)}
  />
  <span>{title}</span>
  <button type="button" onClick={() => handleDeleteTodo(id)}>Delete</button>
</li>;
