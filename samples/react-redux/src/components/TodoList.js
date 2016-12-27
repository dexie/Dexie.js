import React, { PropTypes } from 'react';

import Todo from './Todo';

const TodoList = ({todos, handleToggleTodo, handleDeleteTodo}) => <ul>
  {todos.map((todo) => <Todo
    key={todo.id}
    {...todo}
    handleToggleTodo={handleToggleTodo}
    handleDeleteTodo={handleDeleteTodo}
  />)}
</ul>;

TodoList.propTypes = {
  todos: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    done: PropTypes.bool,
  })),
  handleToggleTodo: PropTypes.func.isRequired,
  handleDeleteTodo: PropTypes.func.isRequired
};

export default TodoList;
