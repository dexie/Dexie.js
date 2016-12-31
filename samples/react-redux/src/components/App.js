import React, { PropTypes } from 'react';
import './App.css';

import AddTodo from './AddTodo';
import TodoList from './TodoList';

const App = ({todos, handleUpdateTodo, handleDeleteTodo, handleAddTodo}) => <div className="App">
  <div className="App-header">
    <h2>React + Redux + Dexie Todo Example</h2>
  </div>
  <AddTodo handleAddTodo={handleAddTodo} />
  <TodoList
    todos={todos}
    handleToggleTodo={handleUpdateTodo}
    handleDeleteTodo={handleDeleteTodo}
  />
</div>;

App.propTypes = {
  todos: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    done: PropTypes.bool,
  })),
  handleUpdateTodo: PropTypes.func.isRequired,
  handleDeleteTodo: PropTypes.func.isRequired,
  handleAddTodo: PropTypes.func.isRequired,
};

export default App;
