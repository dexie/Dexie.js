import React from 'react';
import {Todo} from './Todo';

export function TodoList ({todoQuery, handleToggleTodo, handleDeleteTodo}) {
  const todos = useSubscription(todoQuery);

  return <ul>
    {todos.map(todo => <Todo
      key={todo.id}
      {...todo}
      handleToggleTodo={handleToggleTodo}
      handleDeleteTodo={handleDeleteTodo}
    />)}
  </ul>;
}

