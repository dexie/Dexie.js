import React from 'react';
import {Todo} from './Todo';

export const TodoList = ({todos, handleToggleTodo, handleDeleteTodo}) => <ul>
  {todos.load().map(todo => <Todo
    key={todo.id}
    {...todo}
    handleToggleTodo={handleToggleTodo}
    handleDeleteTodo={handleDeleteTodo}
  />)}
</ul>;
