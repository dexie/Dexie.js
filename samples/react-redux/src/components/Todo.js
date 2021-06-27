import React, { PropTypes } from 'react';
import './Todo.css';

const Todo = ({title, id, done, handleToggleTodo, handleDeleteTodo}) => <li>
  <input
    type="checkbox"
    checked={done}
    onChange={(e) => handleToggleTodo(id, !done)}
  />
  <span>{title}</span>
  <button type="button" onClick={() => handleDeleteTodo(id)}>Delete</button>
</li>;

Todo.propTypes = {
  title: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  done: PropTypes.bool,
  handleToggleTodo: PropTypes.func.isRequired,
  handleDeleteTodo: PropTypes.func.isRequired
};

export default Todo;
